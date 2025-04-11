export interface UserInfoInterface {
  code?: number;
  name?: string;
  token: string;
  userId: number;
  userName: string;
  userFirstName: string;
  userEmail: string;
  userPhone: string;
  userImageBase64: string;
  userImageUrl: string;
  defaultPropertyId: number;
  expirationDate: number;
  availabilityRuleFields: string[]
  newPassword: string;
}

export interface UserNameInfoInterface {
  login: string;
}
