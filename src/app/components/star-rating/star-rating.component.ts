import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.css']
})
export class StarRatingComponent implements OnChanges {

  public starWidth: number | undefined;
  @Input() // permet de recevoir une valeur venant du composant parent
  public rating: number = 2;

  @Output() // permet d'envoyer une valeur vers le composant parent
  public starRatingClicked: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.starWidth = this.rating * 125 / 5;
  }

  public sendRating(): void {
    this.starRatingClicked.emit(`${this.rating}`)
  }

}
