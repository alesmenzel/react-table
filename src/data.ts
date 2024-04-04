import { fakerEN } from '@faker-js/faker';

export type PersonRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  person: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  personSortValue: string;
  personSearchIndex: string;
  firstNameLowerCased: string;
  lastNameLowerCased: string;
  emailLowerCased: string;
  usage: number;
  index: string;
};

export const ITEMS: PersonRow[] = Array.from({ length: 1_000 }).map((_, i) => {
  const firstName = fakerEN.person.firstName();
  const lastName = fakerEN.person.lastName();
  const email = fakerEN.internet.email();
  const id = `id-${i}`;

  return {
    id,
    firstName,
    lastName,
    email,
    person: {
      id,
      firstName,
      lastName,
      email,
    },
    personSortValue: `${firstName} ${lastName}`,
    personSearchIndex: [
      id,
      firstName.toLowerCase(),
      lastName.toLowerCase(),
      email.toLowerCase(),
    ].join(' '),
    firstNameLowerCased: firstName.toLowerCase(),
    lastNameLowerCased: lastName.toLowerCase(),
    emailLowerCased: email.toLowerCase(),
    usage: Math.round(Math.random() * 200_000),
    index: [
      id,
      firstName.toLowerCase(),
      lastName.toLowerCase(),
      email.toLowerCase(),
    ].join(' '),
  };
});
