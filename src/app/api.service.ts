import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private api_url: string = 'http://localhost:5000/api/';
  constructor(private httpClient: HttpClient) { }

  getLast(): Observable<any> {
    return this.httpClient.get(`${this.api_url}`)
      .pipe(map((resp: any) => Object.keys(resp.message)),
        catchError(error => this.throwError(error))
      );
  }
  getValuesFromOne(indicator: string): Observable<any> {
    console.log('url', `${this.api_url}values/${indicator}`);

    return this.httpClient.get(`${this.api_url}values/${indicator}`)
      .pipe(map((resp: any) => resp.message),
        catchError(error => this.throwError(error))
      );
  }
  getValuesFromDate(name: any, date: any): Observable<any> {
    console.log('url', `${this.api_url}date/${name}/${date}`);
    return this.httpClient.get(`${this.api_url}date/${name}/${date}`)
      .pipe(map((resp: any) => resp.message),
        catchError(error => this.throwError(error))
      );
  }

  throwError(error: any) {
    console.error(error);
    return throwError(() => { error.json().error || 'Server error' });
  }
}
