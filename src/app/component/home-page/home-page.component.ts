import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'src/app/api.service';
import { startWith, map, switchMap } from 'rxjs/operators';
import { EChartsOption } from 'echarts';
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  providers: [ApiService]
})
export class HomePageComponent implements OnInit {
  public options: EChartsOption = {
    title: { text: 'Indicator Value' },
    tooltip: {},
    xAxis: {
      type: 'category'
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        type: 'line',
      },
    ],
  };
  dayValue = {
    date: '',
    key: '',
    name: '',
    unit: '',
    value: 0
  };
  dates: string[] = [];
  visibleGraph = false;
  visibleDateResult = false;
  mergeOption: any;
  loading = false;
  selectedIndicator: string = '';
  $allIndicators: any;
  $filteredIndicators: any;
  constructor(private apiService: ApiService,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.$allIndicators = this.apiService.getLast();
    if (this.indicator) {
      this.$filteredIndicators = this.indicator.valueChanges
        .pipe(startWith(''), switchMap((value: any) => this.filterIndicators(value)));
    }
  }

  private filterIndicators(value: string) {
    this.visibleGraph = false;
    this.dates = [];
    let filterValue = '';
    if (value) {
      filterValue = typeof value === 'string' ? value.toLowerCase() : '';
      return this.$allIndicators.pipe(map((indicators: any) => indicators.filter((indicator: any) => indicator.toLowerCase().includes(filterValue))));
    } else {
      return this.$allIndicators;
    }
  }
  displayFn(indicator: string): string {
    return indicator;
  }

  indicatorForm = this.formBuilder.group({
    indicator: [null, Validators.required]
  });

  get indicator() {
    return this.indicatorForm.get('indicator');
  }
  onFormSubmit() {
    this.selectedIndicator = this.indicator ? this.indicator.value : '';
    if (this.selectedIndicator) {
      this.getValuesFromIndicator(this.selectedIndicator);
    }
  }
  resetForm() {
    this.visibleGraph = false;
    this.visibleDateResult = false;
    this.dates = []
    this.indicatorForm.reset();
  }

  getValuesFromIndicator(indicator: string) {
    this.dates = [];
    this.apiService.getValuesFromOne(indicator).subscribe({
      next: (resp: any) => {
        const datakeys = Object.keys(resp.values);

        const datavalues: number[] = [];
        datakeys.forEach((k: any) => {
          this.dates.push(this.formatDate(k));
          datavalues.push(resp.values[k]);
        });
        this.options = {
          tooltip: {
            show: true
          },
          xAxis: {
            type: 'category',
            data: this.dates
          },
          yAxis: {
            type: 'value',
          },
          series: [
            {
              type: 'line',
            },
          ],
          dataZoom: {
            type: 'inside',
            disabled: false,
            start: 0,
            end: 100,
            zoomOnMouseWheel: true
          }
        };
        this.mergeDataValues(datavalues);
        this.visibleGraph = true;
      },
      error: (err: any) => {
        console.error('An error accessing API');
      }
    });
  }

  mergeDataValues(data: number[]) {
    this.mergeOption = { series: [{ data }] };
  }

  chartClick(ev: any) {
    // to be implemented
    console.log('ev', ev);
  }

  formatDate(date: any) {
    var d = new Date((parseInt(date) * 1000) + 86400000),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [day, month, year].join('-');
  }

  formatStringDate(date: any) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [day, month, year].join('-');
  }
  selectedDate(event: any) {
    this.getValuesFromDate(`${this.formatStringDate(event.value)}`);
  }

  getValuesFromDate(date: string) {
    this.apiService.getValuesFromDate(this.selectedIndicator, date).subscribe({
      next: (resp: any) => {
        this.dayValue = {
          date: this.formatDate(resp.date),
          key: resp.key,
          name: resp.name,
          unit: resp.unit,
          value: resp.value ? resp.value : 0
        }
        this.visibleDateResult = true;
      },
      error: (err: any) => {
        console.error('An error accessing API');
      }
    });
  }
}