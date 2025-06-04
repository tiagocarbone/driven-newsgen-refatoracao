import { Request, Response } from "express";
import httpStatus from "http-status";

import * as service from "./../services/news-service";

import { AlterNewsData, CreateNewsData } from "../repositories/news-repository";


export async function getNews(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const order = req.query.order === "asc" ? "asc" : "desc";
  const title = typeof req.query.title === "string" ? req.query.title : undefined;

  const news = await service.getNews({ page, order, title });
  return res.send(news);
}

export async function getSpecificNews(req: Request, res: Response) {

  const id = validateId(req.params.id)

  const news = await service.getSpecificNews(id);
  return res.send(news);
}

export async function createNews(req: Request, res: Response) {
  const newsData = req.body as CreateNewsData;
  const createdNews = await service.createNews(newsData);

  return res.status(httpStatus.CREATED).send(createdNews);
}

export async function alterNews(req: Request, res: Response) {

  const id = validateId(req.params.id)

  const newsData = req.body as AlterNewsData;
  const alteredNews = await service.alterNews(id, newsData);

  return res.send(alteredNews);
}

export async function deleteNews(req: Request, res: Response) {

  const id = validateId(req.params.id)
  await service.deleteNews(id);
  return res.sendStatus(httpStatus.NO_CONTENT);
}



export function validateId(idParam: string): number {
  const id = parseInt(idParam);
  if (isNaN(id) || id <= 0) {
    const error = new Error("Id is not valid.");
    error.name = "BadRequest";
    throw error;
  }
  return id;
}