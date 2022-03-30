import {AfterViewInit, Component, Input, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {ProductDataService} from "../../variables/product-data.service";
import { Chart } from 'chart.js';
import {IRemark} from "../../variables/product-data";
import { ColDef } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular'


@Component({
  selector: 'app-product-info',
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.css']
})
export class ProductInfoComponent implements OnInit, AfterViewInit {

  canvas: any;
  ctx: any;
  @ViewChild('mychart') mychart:any;
  @ViewChild('mypie') mypie:any;

  public polarity: Array<number> = [];
  public polarityCount: {[key: string]: number} = {};
  public subjectivity: Array<number> = []
  public topics: Array<number> = []
  public remarks: IRemark[] = [];
  // public countTopic: any = [];
  public countTopic: {[key: number]: number} = {};
  @Input() childCurrentId = 1;
  // public count: Array<number> = []

  @ViewChild('agGrid', {static: false}) agGrid!: AgGridAngular;
  columnDefs: ColDef[] = [
        { field: 'id', sortable: true, filter: true },
        { field: 'product_id', sortable: true, filter: true },
        { field: 'dominant_topic', sortable: true, filter: true },
        { field: 'topic_perc_contrib', sortable: true, filter: true },
        { field: 'date', sortable: true, filter: true },
        { field: 'region', sortable: true, filter: true },
        { field: 'keyword', sortable: true, filter: true, resizable: true },
        { field: 'remark', sortable: true, filter: true },
        { field: 'polarity', sortable: true, filter: true },
        { field: 'subjectivity', sortable: true, filter: true }
    ];


  constructor(public productDataService: ProductDataService) {}

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

  }

  getSelectedRows(): void {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    // const selectedDataStringPresentation = selectedData.map(node => `${node.make} ${node.model}`).join(', ');
    const selectedDataStringPresentation = selectedData.map(node => `${node.remark}`);

    alert(`Commentaire: ${selectedDataStringPresentation}`);
  }

  getRemarks(): void {
    this.productDataService.modifycurrentId(this.childCurrentId)
    // Get reviews from api
    this.productDataService.getProductDetails().subscribe({
      next: details => {
        this.remarks = details;
        this.polarity = this.remarks.map((item) =>{
          return item.polarity;
        });

        // Trie des commentaires selon qu'ils soient positifs négatifs ou neutre
        this.polarityCount['CPositif'] = this.remarks.filter((item) =>{
          return item.polarity > 0.1
        }).map((item) => {return 'positif'}).length;
        // console.log('le test:', this.polarityCount)
        this.polarityCount['CNegatif'] = this.remarks.filter((item) =>{
          return item.polarity < -0.1
        }).map((item) => {return 'positif'}).length;
        // console.log('le test:', this.polarityCount)
        this.polarityCount['CNeutre'] = this.remarks.filter((item) =>{
          return item.polarity >= -0.1 || item.polarity <= 0.1
        }).map((item) => {return 'positif'}).length;
        // console.log('le test:', this.polarityCount)
        // Fin du trie

        this.subjectivity = this.remarks.map((item) =>{
          return item.subjectivity;
        });
        this.topics = this.remarks.map((item) =>{
          return item.dominant_topic;
        });
        // console.log('polarity', this.polarity);
        this.countTopic = this.getTopicCount(this.topics);
        this.polarityGraph();
        this.topicGraph();
        // this.getTopicRemark();
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getRemarks();

  }

  getTopicCount(topicList: Array<number>){
    var topcs = topicList.reduce(function (acc: {[key: number]: number}, curr) {
      if (typeof acc[curr] == 'undefined') { acc[curr] = 1; } else { acc[curr] += 1; } return acc;
      }, {});
    // this.count = Object.values(topcs)
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

  polarityGraph(): void {
    this.canvas = this.mychart.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    new Chart(this.ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(this.polarityCount),
        datasets: [{
          label: 'Nbr de commentaire',
          data: Object.values(this.polarityCount),
          backgroundColor: ["#3af26b", "#db6307", "#c9c9c9"],
          // fill: true,
        },
        ],
      },
      options: {
        // maintainAspectRatio: true,
        plugins: {
          labels: {
            render: 'percentage',
            fontColor: ['green', 'white', 'red'],
            precision: 2
          }
        },

        title: {
          display: true,
          text: "Polarité",
          fontSize: 14,
        },
        legend: {
          display: false,
        },
      }
    });
    }

  topicGraph(): void {
      this.canvas = this.mypie.nativeElement;
      this.ctx = this.canvas.getContext('2d');

      new Chart(this.ctx, {
        type: 'bar',
        data: {
          datasets: [{
            label: 'Nbr commentaire',
            // data: this.polarity,
            // data: this.count,
            data: Object.values(this.countTopic),
            backgroundColor: ["#3be3f6", "#868686", "#f3a266"],
            // borderColor: Object.values(count.CHART_COLORS),
            borderColor: "#007ee7",
          },
          ],
            labels: Object.keys(this.countTopic)
        },
        options: {
          title: {
            display: true,
            text: "Sujet",
            fontSize: 14,
          },
          legend: {
            display: false,
          },
        }
      });
    }

}
