import prisma from "./../database";
import { News } from "@prisma/client";

export type CreateNewsData = Omit<News, "id" | "createAt">;
export type AlterNewsData = CreateNewsData;

/*
export function getNews() {
  return prisma.news.findMany({
    orderBy: {
      publicationDate: "desc"
    }
  });
}
  */

type GetNewsParams = {
  page: number;
  order: "asc" | "desc";
  title?: string;
};

export function getNews({ page, order, title }: GetNewsParams) {
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  return prisma.news.findMany({
    where: title
      ? {
          title: {
            contains: title,
            mode: "insensitive"
          }
        }
      : undefined,
    orderBy: {
      publicationDate: order
    },
    skip,
    take: pageSize
  });
}

export function getNewsById(id: number) {
  return prisma.news.findUnique({
    where: { id }
  })
}

export async function createNews(newsData: CreateNewsData) {
  return prisma.news.create({
    data: { ...newsData, publicationDate: new Date(newsData.publicationDate) }
  });
}

export async function updateNews(id: number, news: AlterNewsData) {
  return prisma.news.update({
    where: { id },
    data: { ...news, publicationDate: new Date(news.publicationDate) }
  })
}

export async function removeNews(id: number) {
  return prisma.news.delete({
    where: { id }
  })
}