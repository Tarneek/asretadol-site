export class UserProfileDto {
  id!: string;
  mobile!: string;
  email!: string | null;
  displayName!: string;
  role!: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
