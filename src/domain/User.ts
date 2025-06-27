export class User {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  getFullName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
