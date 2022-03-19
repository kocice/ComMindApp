import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ComMindApp';
  currentId = 1;

  changeId(id: number) {
    this.currentId = id;
  }
}
