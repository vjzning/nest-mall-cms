export interface MemberAddress {
  id: string;
  memberId: string;
  receiverName: string;
  receiverPhone: string;
  countryCode: string;
  countryName: string;
  stateProvince: string;
  city: string;
  districtCounty: string;
  addressLine1: string;
  addressLine2?: string | null;
  postalCode: string;
  isDefault: number | boolean;
  tag?: string | null;
  createdAt: string;
  updatedAt: string;
}
