import { faker } from "@faker-js/faker";
import { CreateNewsData } from "../../src/repositories/news-repository";
import prisma from "../../src/database";

export function generateRandomNews(firstHand = false): CreateNewsData {
  return {
    author: faker.person.fullName(),
    firstHand,
    text: faker.lorem.paragraphs(5),
    publicationDate: faker.date.future(),
    title: faker.lorem.words(7)
  }
}

export async function createNewsWithTitle(title: string) {
  return await prisma.news.create({
    data: {
      author: faker.person.fullName(),
      firstHand: false,
      text: faker.lorem.paragraphs(5),
      publicationDate: faker.date.future(),
      title
    }
  });
}

export async function createNewsWithPublicationDate(date: Date) {
  return await prisma.news.create({
    data: {
      author: faker.person.fullName(),
      firstHand: false,
      text: faker.lorem.paragraphs(5),
      publicationDate: date,
      title: faker.lorem.words(6)
    }
  });
}

export async function createNewsInPastDate() {
  return await createNewsWithPublicationDate(faker.date.past({ years: 1 }));
}

export async function createNewsInFutureDate() {
  return await createNewsWithPublicationDate(faker.date.future({ years: 1 }));
}

export async function persistNewRandomNews(firstHand = false) {
  return await prisma.news.create({
    data: generateRandomNews(firstHand)
  });
}

export async function persistNewRandomNewsInThePast(firstHand = false) {
  const eventData = generateRandomNews(firstHand);
  eventData.publicationDate = faker.date.past();

  return await prisma.news.create({
    data: eventData
  });
}