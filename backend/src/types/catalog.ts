// Local types mirroring the Prisma relations for the PDF services
// These match the shape returned by catalogs.service getById()

export interface CatalogConfig {
  layout:           string
  format:           string
  productsPerPage:  number
  showCode:         boolean
  showDescription:  boolean
  showPrice1:       boolean
  showPrices2to6:   boolean
  showStock:        boolean
  logoOnEachPage:   boolean
}

export interface ProductImageRef {
  id:           string
  filename:     string
  url:          string
  thumbnailUrl: string | null
}

export interface ProductRef {
  id:          string
  name:        string
  code:        string
  description: string | null
  price1:      unknown  // Decimal from Prisma — serialized as string
  price2:      unknown
  price3:      unknown
  price4:      unknown
  price5:      unknown
  price6:      unknown
  stock:       number | null
  image:       ProductImageRef | null
}

export interface CatalogProductEntry {
  id:              string
  catalogId:       string
  productId:       string
  position:        number
  imageOverrideId: string | null
  product:         ProductRef
  imageOverride:   ProductImageRef | null
}

export interface Catalog {
  id:           string
  name:         string
  slug:         string
  description:  string | null
  config:       CatalogConfig
  guestVisible: boolean
  pdfUrl:       string | null
  createdBy:    string
  createdAt:    Date
  updatedAt:    Date
  products:     CatalogProductEntry[]
}
