import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class BetService {

  baseURL = "";

  constructor(private http: Http) { }

  getComponents() {

  	var url =   this.baseURL + '/getmetadata';

    return this.http
      .get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  getRecords() {
    var url =   this.baseURL + '/getrecords';

    return this.http
      .get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}

@Injectable()
export class BetXHRService {

  constructor(private http: Http) { }

  getCookieByName(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
  }

  postRequest(url, params) {
    var _this = this;

    return new Promise(function (resolve, reject) {  
        var xhr = XMLHttpRequest ? new XMLHttpRequest() : 
                                   new ActiveXObject("Microsoft.XMLHTTP"); 
                               
        xhr.open("POST", url, true); 
        xhr.setRequestHeader("X-CSRFToken", _this.getCookieByName('csrftoken'));

        xhr.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            resolve(xhr.response);
          } else {
            reject({
              status: this.status,
              statusText: xhr.statusText
            });
          }
        };

        xhr.onerror = function () {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        };

        xhr.send(params);
    }); 
  }
}