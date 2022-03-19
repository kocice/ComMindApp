export interface IProduct {
  id: number;
  title: string;
  product_url: string;
  image_url: string;
  product_rating: number;
}

export interface IRemark {
  id: number;
  product_id: number;
  dominant_topic: number;
  topic_perc_contrib: number;
  date: Date;
  region: string;
  keyword: string;
  remark: string;
  polarity: number;
  subjectivity: number
}
