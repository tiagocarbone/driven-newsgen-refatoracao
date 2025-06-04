import prisma from "../database";
import * as newsRepository from "../repositories/news-repository";
import { AlterNewsData, CreateNewsData } from "../repositories/news-repository";


type GetNewsParams = {
  page: number;
  order: "asc" | "desc";
  title?: string;
};

export async function getNews(params: GetNewsParams) {
  return newsRepository.getNews(params);
}

export async function getSpecificNews(id: number) {
  const news = await newsRepository.getNewsById(id);
  if (!news) {
    const error = new Error(`News with id ${id} not found.`);
    error.name = "NotFound";
    throw error;
  }

  return news;
}

export async function createNews(newsData: CreateNewsData) {
  await validateNews(newsData);
  return newsRepository.createNews(newsData);
}

export async function alterNews(id: number, newsData: AlterNewsData) {
  const news = await getSpecificNews(id);
  await validateNews(newsData, news.title !== newsData.title);

  return newsRepository.updateNews(id, newsData);
}

export async function deleteNews(id: number) {
  await getSpecificNews(id);
  return newsRepository.removeNews(id);
}

export async function validateNews(newsData: CreateNewsData, isNew = true) {
  if (isNew) await ensureTitleIsUnique(newsData.title);
  validateTextLength(newsData.text);
  validatePublicationDate(newsData.publicationDate);
}

async function ensureTitleIsUnique(title: string) {
  const existingNews = await prisma.news.findFirst({ where: { title } });
  if (existingNews) {
    const error = new Error(`News with title "${title}" already exists.`);
    error.name = "Conflict";
    throw error;
  }
}


function validateTextLength(text: string) {
  if (text.length < 500) {
    const error = new Error("The news text must be at least 500 characters long.");
    error.name = "BadRequest";
    throw error;
  }
}



function validatePublicationDate(date: string | Date) {
  const publicationDate = new Date(date);
  if (publicationDate.getTime() < Date.now()) {
    const error = new Error("The publication date cannot be in the past.");
    error.name = "BadRequest";
    throw error;
  }
}

