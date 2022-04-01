import {AfterViewInit, Component, Input, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {ProductDataService} from "../../variables/product-data.service";
import {Chart, registerables} from 'chart.js';
import {IRemark} from "../../variables/product-data";
import {ColDef, ValueFormatterParams} from 'ag-grid-community';
import {AgGridAngular} from 'ag-grid-angular';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Swal from 'sweetalert2'

Chart.register(...registerables);


@Component({
  selector: 'app-product-info',
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.css']
})
export class ProductInfoComponent implements OnInit, AfterViewInit {

  polarityChart: any;
  topicChart: any
  canvas: any;
  ctx: any;
  @ViewChild('mychart') mychart: any;
  @ViewChild('mypie') mypie: any;

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
        { field: 'id', sortable: true, filter: true, width: 70},
        { headerName: 'ID Produit', field: 'product_id', sortable: true, filter: true, width: 100},
        { headerName: 'Thématique', field: 'dominant_topic', sortable: true, filter: true, width: 90},
        { headerName: 'Impact du Sujet', field: 'topic_perc_contrib', sortable: true, filter: true, valueFormatter: this.roundFormatter, width: 100},
        { field: 'date', sortable: true, filter: true, width: 120},
        { field: 'region', sortable: true, filter: true, width: 100},
        { headerName: 'Mots clés (Sujet)', field: 'keyword', sortable: true, filter: true, resizable: true },
        { headerName: 'Commentaire', field: 'remark', sortable: true, filter: true },
        { headerName: 'Satisfaction', field: 'polarity', sortable: true, filter: true, valueFormatter: this.roundPolarity, width: 100},
        { headerName: 'Subjectivité', field: 'subjectivity', sortable: true, filter: true, valueFormatter: this.roundFormatter, width: 100}
    ];
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 70
  };


  constructor(public productDataService: ProductDataService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  roundPolarity(params: ValueFormatterParams) {
    return params.value.toFixed(3)
  }

  roundFormatter(params: ValueFormatterParams) {
    let renderValue = params.value * 100;
    return `${renderValue.toFixed(2)}%`;
  }

  getSelectedRows(): void {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    // const selectedDataStringPresentation = selectedData.map(node => `${node.make} ${node.model}`).join(', ');
    const selectedDataStringPresentation = selectedData.map(node => `${node.remark}`);
    const subject = selectedData.map(node => `${node.dominant_topic}`);
    const keyword = selectedData.map(node => `${node.keyword}`);
    const commentId = selectedData.map(node => `${node.id}`);

    // alert(`Commentaire: ${selectedDataStringPresentation}`);
    Swal.fire({
      title: `<strong>Thématique: <u>${subject}</u></strong></br></br>voir plus`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Commentaire',
      denyButtonText: `Mots clés`,
    })
    .then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        Swal.fire(`<strong>Thématique: <u>${subject}</u></strong></br></br>${selectedDataStringPresentation}`, `<p>Commentaire <strong>N°${commentId}</strong></p><hr></p><p>${keyword}</p>`, 'success')
      } else if (result.isDenied) {
        Swal.fire(`<strong>Sujet: <u>${subject}</u></strong></br></br>${keyword}`, '', 'info')
      }
    })
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

        if (!!this.polarityChart) {
          this.polarityChart.destroy()
          this.topicChart.destroy()
        }
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
    // this.count = Object.values(topcs)
    return topicList.reduce(function (acc: { [key: number]: number }, curr) {
      if (typeof acc[curr] == 'undefined') {
        acc[curr] = 1;
      } else {
        acc[curr] += 1;
      }
      return acc;
    }, {})
  }

  // Affichage des graphiques
  polarityGraph(): void {
    this.canvas = this.mychart.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    const data = {
      labels: Object.keys(this.polarityCount),
      datasets: [
        {
          label: 'Nbr de commentaire',
          data: Object.values(this.polarityCount),
          backgroundColor: ["#3af26b", "#db6307", "#c9c9c9"]
        },
      ]
    };

    this.polarityChart = new Chart(this.ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: 'Satisfaction',
              // color: '#000',
              font: {
                weight: 'bold',
                size: 16,
              }
            },
            tooltip: {
              enabled: false
            },
            datalabels: {
              align: 'center',
              color: '#000',
              labels: {
                title: {
                  font: {
                    weight: 'bold',
                  }
                },
              },
              formatter: (value, context) => {
                const datapoints = context.chart.data.datasets[0].data;
                function totalSum(total: number, datapoint: any) {
                  return total + datapoint;
                }
                const totalValue = datapoints.reduce(totalSum, 0);
                const percentageValue = (value / totalValue * 100).toFixed(2)
                return [`${percentageValue}%`];
              }
            }
          }
        },
      plugins: [ChartDataLabels]
    });

  }

  topicGraph(): void {
      this.canvas = this.mypie.nativeElement;
      this.ctx = this.canvas.getContext('2d');

      const data = {
        labels: Object.keys(this.countTopic),
          datasets: [
            {
              label: 'Nbr de commentaire',
              data: Object.values(this.countTopic),
              backgroundColor: ["#3be3f6", "#868686", "#f3a266"],
              // borderColor: "#007ee7",
            },
          ]
      };

      this.topicChart = new Chart(this.ctx, {
        type: 'pie',
        data: data,
        options: {
        maintainAspectRatio: true,
        responsive: true,
          plugins: {
            legend: {
              display: false,
              position: 'top',
            },
            title: {
              display: true,
              text: 'Sujet',
              // color: '#000',
              font: {
                weight: 'bold',
                size: 16,
              }
            },
            datalabels: {
              align: 'center',
              color: ['#000', '#FFF', '#000'],
              labels: {
                title: {
                  font: {
                    weight: 'bold',
                  }
                },
              },
              formatter: (value, context) => {
                const datapoints = context.chart.data.datasets[0].data;
                const sujects = context.chart.data.labels
                function totalSum(total: number, datapoint: any) {
                  return total + datapoint;
                }
                const totalValue = datapoints.reduce(totalSum, 0);
                const percentageValue = (value / totalValue * 100).toFixed(2)
                return [`Total: ${value}`, `${percentageValue}%`];
              }
            }
          }
        },
        plugins: [ChartDataLabels]

      });
    }

}
