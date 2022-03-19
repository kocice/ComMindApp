import {Component, Input, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {ProductDataService} from "../../variables/product-data.service";
import { Chart } from 'chart.js';
import {IRemark} from "../../variables/product-data";


@Component({
  selector: 'app-product-info',
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.css']
})
export class ProductInfoComponent implements OnInit {

  canvas: any;
  ctx: any;
  @ViewChild('mychart') mychart:any;
  @ViewChild('mypie') mypie:any;
  public polarity: Array<number> = [];
  public subjectivity: Array<number> = []
  public topics: Array<number> = []
  private remarks: IRemark[] = [];
  public countTopic: any = [];
  @Input() childCurrentId = 1;
  public count: Array<number> = []




  constructor(private productDataService: ProductDataService) { }

  ngOnInit(): void { }

  getRemarks(): void {
    this.productDataService.modifycurrentId(this.childCurrentId)
    // Get reviews from api
    this.productDataService.getProductDetails().subscribe({
      next: details => {
        this.remarks = details;
        this.polarity = this.remarks.map((item) =>{
          return item.polarity;
        });
        this.subjectivity = this.remarks.map((item) =>{
          return item.subjectivity;
        });
        this.topics = this.remarks.map((item) =>{
          return item.dominant_topic;
        });
        // console.log('polarity', this.polarity);
        this.ngAfterViewInit();
        this.ngAfterView();
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getRemarks()
    this.countTopic = this.getTopicCount(this.topics)
  }

  getTopicCount(topicList: Array<number>){
    var topcs = topicList.reduce(function (acc: {[key: number]: number}, curr) {
      if (typeof acc[curr] == 'undefined') { acc[curr] = 1; } else { acc[curr] += 1; } return acc;
      }, {});
    console.log('topics', topcs)
    console.log('key: ', Object.keys(topcs))
    console.log('Values: ', Object.values(topcs))
    this.count = Object.values(topcs)
    return topcs
  }

  getMax(table: Array<number>): string {
    return Math.max.apply(null, table).toFixed(3);
  }

  getMin(table: Array<number>): string {
    return Math.min.apply(null, table).toFixed(3);
  }

  getMean(table: Array<number>): string {
    let somme = table.reduce(
      (previousValue, currentValue) => previousValue + currentValue, 0
    );
    return (somme / table.length).toFixed(3);
  }

  ngAfterViewInit(): void {
    // if (this.remarks.length) {
      this.canvas = this.mychart.nativeElement;
      this.ctx = this.canvas.getContext('2d');

      new Chart(this.ctx, {
        type: 'line',
        data: {
          datasets: [{
            label: 'Current Vallue',
            data: this.polarity,
            backgroundColor: "rgb(115 185 243 / 65%)",
            borderColor: "#007ee7",
            fill: true,
            pointStyle: 'circle',
            pointRadius: 10,
            pointHoverRadius: 15
          },
          //   {
          //     label: 'Invested Amount',
          //     data: [0, 20, 40, 60, 80],
          //     backgroundColor: "#47a0e8",
          //     borderColor: "#007ee7",
          //     fill: true,
          // }
          ],
            labels: ['Période 1', 'Période 2', 'Période 3', 'Période 4', 'Période 5']
        },
        options: {
          title: {
            display: true,
            // text: (ctx) => 'Point Style: ' + ctx.chart.data.datasets[0].pointStyle,
            text: "Polarity",
            fontSize: 18,
          },
          legend: {
            display: false,
          },
        }
      });
    }
  // }

  ngAfterView(): void {
    // if (this.remarks.length) {
      this.canvas = this.mypie.nativeElement;
      this.ctx = this.canvas.getContext('2d');

      new Chart(this.ctx, {
        type: 'pie',
        data: {
          datasets: [{
            label: 'Current Vallue',
            // data: this.polarity,
            data: this.count,
            backgroundColor: "rgb(215 185 232 / 65%)",
            // borderColor: Object.values(count.CHART_COLORS),
            borderColor: "#007ee7",
            // fill: true,
            // pointStyle: 'circle',
            // pointRadius: 10,
            // pointHoverRadius: 15
          },
          ],
            labels: Object.keys(this.countTopic)
        },
        options: {
          title: {
            display: true,
            // text: (ctx) => 'Point Style: ' + ctx.chart.data.datasets[0].pointStyle,
            text: "Topics",
            fontSize: 18,
          },
          legend: {
            display: false,
          },
        }
      });
    }

}
