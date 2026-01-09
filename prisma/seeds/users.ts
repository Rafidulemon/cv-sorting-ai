import { OrgRole } from '@prisma/client';

type SeedUser = {
  id: string;
  firstName: string;
  lastName?: string;
  role: OrgRole;
  email: string;
  phone?: string;
  password: string;
  companyId: string;
};

export const users: SeedUser[] = [
  {
    id: '1',
    firstName: 'Carriastic',
    role: OrgRole.SUPER_ADMIN,
    email: 'carriastic@gmail.com',
    phone: '+8801990497796',
    password: 'Carriastic321*',
    companyId: '1',
  },
  {
    id: '2',
    firstName: 'Md. Rafidul',
    lastName: 'Islam',
    role: OrgRole.COMPANY_ADMIN,
    email: 'rafid.carriastic@gmail.com',
    phone: '+8801850700054',
    password: 'Carriastic4321*',
    companyId: '1',
  },
  {
    id: '3',
    firstName: 'Ahsan Habib',
    lastName: 'Ethic',
    role: OrgRole.COMPANY_ADMIN,
    email: 'ethic.carriastic@gmail.com',
    phone: '+8801850700054',
    password: 'Carriastic4321*',
    companyId: '1',
  },
  {
    id: '4',
    firstName: 'Syed Hasan',
    lastName: 'Ahmed',
    role: OrgRole.COMPANY_ADMIN,
    email: 'hasan.carriastic@gmail.com',
    phone: '+8801850700054',
    password: 'Carriastic4321*',
    companyId: '1',
  },
  {
    id: '5',
    firstName: 'Test',
    lastName: 'HR',
    role: OrgRole.COMPANY_MEMBER,
    email: 'carriastic.hr@gmail.com',
    phone: '+8801850700054',
    password: 'Carriastic54321*',
    companyId: '1',
  },
  {
    id: '6',
    firstName: 'Viewer',
    role: OrgRole.VIEWER,
    email: 'rafidulemon@gmail.com',
    phone: '+8801850700054',
    password: 'Carriastic21*',
    companyId: '1',
  },
];
