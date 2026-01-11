import { UserRole } from '@prisma/client';

type SeedUser = {
  id: string;
  firstName: string;
  lastName?: string;
  image?: string;
  role: UserRole;
  email: string;
  phone?: string;
  title?: string;
  team?: string;
  timezone?: string;
  profileStatus?: string;
  startedAt?: Date;
  password: string;
  companyId?: string | null;
};

export const users: SeedUser[] = [
  {
    id: '1',
    firstName: 'Carriastic',
    image: '/images/default_dp.png',
    role: UserRole.SUPER_ADMIN,
    email: 'carriastic@gmail.com',
    phone: '+8801990497796',
    title: 'Founder',
    team: 'Leadership',
    timezone: 'GMT+6 · Dhaka',
    profileStatus: 'Active',
    startedAt: new Date('2023-01-15'),
    password: 'Carriastic321*',
    companyId: null,
  },
  {
    id: '2',
    firstName: 'Md. Rafidul',
    lastName: 'Islam',
    image: '/images/rafid.png',
    role: UserRole.COMPANY_ADMIN,
    email: 'rafid.carriastic@gmail.com',
    phone: '+8801850700054',
    title: 'Head of Talent Ops',
    team: 'Talent Intelligence · carriX Labs',
    timezone: 'GMT+6 · Dhaka',
    profileStatus: 'Active',
    startedAt: new Date('2024-01-10'),
    password: 'Carriastic4321*',
    companyId: '1',
  },
  {
    id: '3',
    firstName: 'Ahsan Habib',
    lastName: 'Ethic',
    image: '/images/ethic.png',
    role: UserRole.COMPANY_ADMIN,
    email: 'ethic.carriastic@gmail.com',
    phone: '+8801850700054',
    title: 'Head of Product',
    team: 'Product · carriX Labs',
    timezone: 'GMT+6 · Dhaka',
    profileStatus: 'Active',
    startedAt: new Date('2024-02-20'),
    password: 'Carriastic4321*',
    companyId: '1',
  },
  {
    id: '4',
    firstName: 'Syed Hasan',
    lastName: 'Ahmed',
    image: '/images/hasan.png',
    role: UserRole.COMPANY_ADMIN,
    email: 'hasan.carriastic@gmail.com',
    phone: '+8801850700054',
    title: 'Engineering Lead',
    team: 'Platform · carriX Labs',
    timezone: 'GMT+6 · Dhaka',
    profileStatus: 'Active',
    startedAt: new Date('2024-03-12'),
    password: 'Carriastic4321*',
    companyId: '1',
  },
  {
    id: '5',
    firstName: 'Test',
    lastName: 'HR',
    image: '/images/default_dp.png',
    role: UserRole.COMPANY_MEMBER,
    email: 'carriastic.hr@gmail.com',
    phone: '+8801850700054',
    title: 'Talent Ops',
    team: 'Recruiting · carriX Labs',
    timezone: 'GMT+6 · Dhaka',
    profileStatus: 'Active',
    startedAt: new Date('2024-05-05'),
    password: 'Carriastic54321*',
    companyId: '1',
  },
  {
    id: '6',
    firstName: 'Viewer',
    image: '/images/default_dp.png',
    role: UserRole.VIEWER,
    email: 'rafidulemon@gmail.com',
    phone: '+8801850700054',
    title: 'Viewer',
    team: 'Hiring Partner',
    timezone: 'GMT+6 · Dhaka',
    profileStatus: 'Active',
    startedAt: new Date('2024-06-01'),
    password: 'Carriastic21*',
    companyId: '1',
  },
];
