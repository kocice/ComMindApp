import {Component, OnInit, Output, EventEmitter, Input, SimpleChanges} from '@angular/core';
import {IProduct} from '../../variables/product-data';
import {ProductDataService} from "../../variables/product-data.service";

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  private _productFilter = '';
  public products: IProduct[] = [];
  public errMsg: string | undefined;
  @Output() currentID = new EventEmitter<number>();

  public filteredProducts: IProduct[] = [];
  public receivedRating: string | undefined;
  // status: boolean = false;
  @Input() keyword: string = '';


  constructor(public productDataService: ProductDataService) { }

  ngOnInit(): void {
    this.productDataService.getProductData().subscribe({
      next: products => {
        this.products = products;
        this.filteredProducts = this.products;
      },
      error: err => this.errMsg = err
    });
    this.productFilter = '';
  }

  setTitle(value: string) {
    this.productDataService.productTitle = value
  }

  sendId(value: number) {
    this.currentID.emit(value);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.productFilter = this.keyword
  }

  public get productFilter(): string {
    return this._productFilter;
  }

  public set productFilter(filter: string) {
    this._productFilter = filter;
    this.filteredProducts = this.productFilter ? this.filterProducts(this.productFilter) : this.products
  }

  private filterProducts(criteria: string): IProduct[] {
    criteria = criteria.toLocaleLowerCase();
    return this.products.filter(
      (product: IProduct) => product.title.toLocaleLowerCase().indexOf(criteria) != -1
    );
  }

  public receiveRatingClicked(message: string): void {
    this.receivedRating = message;
  }

}
