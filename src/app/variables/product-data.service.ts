import { Injectable } from '@angular/core';
import {IProduct, IRemark} from "./product-data";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {map, Observable, throwError} from "rxjs";
import { tap, catchError } from 'rxjs/operators'
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ProductDataService {

  // private readonly PRODUCT_API_ULR = 'api/product.json';
  private readonly END_POINT_URL =  environment.baseUrl + 'api/product/';
  private currentProductId = '1';
  // public remarks:  IRemark[] = [];

  constructor(private http: HttpClient) { }

  modifycurrentId(id: number) {
    this.currentProductId = id as unknown as string;
  }

  getProductData(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.END_POINT_URL).pipe(
      tap(products => console.log('products', products)),
      catchError(this.handleError)
    );
  }

  getProductDetails(): Observable<IRemark[]> {
    // return this.http.get<IRemark[]>(this.END_POINT_URL + id).pipe(
    return this.http.get<any>(this.END_POINT_URL + this.currentProductId + '/').pipe(
      map(details => details.remarks),
      tap(details => console.log('details', details)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
