import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentId = 1;
  keyword = "";

  send(keyword: string){
    this.keyword = keyword;
  }

  changeId(id: number) {
    this.currentId = id;
  }
}
