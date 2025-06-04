
import supertest from "supertest";
import app from "../src/app";
import prisma from "../src/database";
import { faker } from '@faker-js/faker';
import httpStatus from "http-status";

import { createNewsWithPublicationDate, createNewsWithTitle, generateRandomNews, persistNewRandomNews } from "./factories/news-factory";

const api = supertest(app);

beforeEach(async () => {
  await prisma.news.deleteMany();
});

afterEach(async () => {
  await prisma.news.deleteMany();
});

describe("GET /news", () => {
  it("should return paginated results (10 per page)", async () => {
    for (let i = 0; i < 15; i++) {
      await persistNewRandomNews();
    }

    const resPage1 = await api.get("/news?page=1");
    const resPage2 = await api.get("/news?page=2");

    expect(resPage1.body.length).toBe(10);
    expect(resPage2.body.length).toBe(5);
  });

  it("should return news ordered by publicationDate ascending", async () => {

    const dateInThePast = new Date("2020-01-01");
    const dateIntheFuture = new Date("2030-01-01")

    const oldNews = await createNewsWithPublicationDate(dateInThePast);
    const newNews = await createNewsWithPublicationDate(dateIntheFuture);

    const res = await api.get("/news?order=asc");

    expect(res.body[0].id).toBe(oldNews.id);
    expect(res.body[res.body.length - 1].id).toBe(newNews.id);
  });

  it("should return news ordered by publicationDate descending (default)", async () => {

    const dateInThePast = new Date("2020-01-01");
    const dateIntheFuture = new Date("2030-01-01")


    const oldNews = await createNewsWithPublicationDate(dateInThePast);
    const newNews = await createNewsWithPublicationDate(dateIntheFuture);

    const res = await api.get("/news");

    expect(res.body[0].id).toBe(newNews.id);
    expect(res.body[res.body.length - 1].id).toBe(oldNews.id);
  });

  it("should filter news by title using 'like'", async () => {

    const string1 = "Driven"
    const string2 = "ffc"

    await createNewsWithTitle(string1);
    await createNewsWithTitle(string2);

    const res = await api.get("/news?title=driven");

    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toMatch(/driven/i);
  });

  it("should apply all filters simultaneously", async () => {


    const stringDriven1 = "Driven A"
    const stringDriven2 = "Driven B"
    const stringDriven3 = "Driven C"


    await createNewsWithTitle(stringDriven1);
    await createNewsWithTitle(stringDriven2);
    await createNewsWithTitle(stringDriven3);

    const otherNews1 = "Other News 1"
    const otherNews2 = "Other News 2"
    const otherNews3 = "Other News 3"

    await createNewsWithTitle(otherNews1);
    await createNewsWithTitle(otherNews2);
    await createNewsWithTitle(otherNews3);

    const res = await api.get("/news?page=1&order=asc&title=Driven");

    expect(res.body.length).toBe(3);

    expect(res.body[0].title.toLowerCase()).toContain("driven");
    expect(res.body[1].title.toLowerCase()).toContain("driven");
    expect(res.body[2].title.toLowerCase()).toContain("driven");
    
  });

});

describe("POST /news", () => {
  it("should create news", async () => {
    const newsBody = generateRandomNews();

    const { body, status } = await api.post("/news").send(newsBody);
    expect(status).toBe(httpStatus.CREATED);
    expect(body).toMatchObject({
      id: expect.any(Number),
      text: newsBody.text
    });

    const news = await prisma.news.findUnique({
      where: {
        id: body.id
      }
    });

    expect(news).not.toBeNull();
  });

  it("should return 422 when body is not valid", async () => {
    const { status } = await api.post("/news").send({});
    expect(status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
  });

  it("should return 409 when title already exist", async () => {
    const news = await persistNewRandomNews();
    const newsBody = { ...generateRandomNews(), title: news.title };
    const { status } = await api.post("/news").send(newsBody);
    expect(status).toBe(httpStatus.CONFLICT);
  });

  it("should return 400 when text is less than 500 chars", async () => {
    const newsBody = generateRandomNews();
    newsBody.text = "short";

    const { status } = await api.post("/news").send(newsBody);
    expect(status).toBe(httpStatus.BAD_REQUEST);
  });

  it("should return 400 when publication date is in the past", async () => {
    const newsBody = generateRandomNews();
    newsBody.publicationDate = faker.date.past({ years: 1 });

    const { status } = await api.post("/news").send(newsBody);
    expect(status).toBe(httpStatus.BAD_REQUEST);
  });

});

describe("DELETE /news", () => {
  it("should delete a news", async () => {
    const { id: newsId } = await persistNewRandomNews();
    const { status } = await api.delete(`/news/${newsId}`);

    expect(status).toBe(httpStatus.NO_CONTENT);

    const news = await prisma.news.findUnique({
      where: {
        id: newsId
      }
    });

    expect(news).toBeNull();
  });

  it("should return 404 when id is not found", async () => {
    const { status } = await api.delete(`/news/1`);
    expect(status).toBe(httpStatus.NOT_FOUND);
  });

  it("should return 400 when id is not valid", async () => {
    const { status } = await api.delete(`/news/0`);
    expect(status).toBe(httpStatus.BAD_REQUEST);
  });

});

describe("PUT /news", () => {
  it("should update a news", async () => {
    const { id: newsId } = await persistNewRandomNews();
    const newsData = generateRandomNews();

    const { status } = await api.put(`/news/${newsId}`).send(newsData);
    expect(status).toBe(httpStatus.OK);

    const news = await prisma.news.findUnique({
      where: {
        id: newsId
      }
    });

    expect(news).toMatchObject({
      text: newsData.text,
      title: newsData.title
    });
  });

  it("should return 404 when id is not found", async () => {
    const newsData = generateRandomNews();

    const { status } = await api.put(`/news/1`).send(newsData);
    expect(status).toBe(httpStatus.NOT_FOUND);
  });

  it("should return 400 when id is not valid", async () => {
    const { status } = await api.delete(`/news/0`);
    expect(status).toBe(httpStatus.BAD_REQUEST);
  });

  it("should return 409 when title already exist", async () => {
    const news = await persistNewRandomNews();
    const news2 = await persistNewRandomNews();

    const newsBody = { ...generateRandomNews(), title: news2.title };
    const { status } = await api.put(`/news/${news.id}`).send(newsBody);
    expect(status).toBe(httpStatus.CONFLICT);
  });

  it("should return 400 when text is less than 500 chars", async () => {
    const news = await persistNewRandomNews();
    const newsBody = generateRandomNews();
    newsBody.text = "short";

    const { status } = await api.put(`/news/${news.id}`).send(newsBody);
    expect(status).toBe(httpStatus.BAD_REQUEST);
  });

  it("should return 400 when publication date is in the past", async () => {
    const news = await persistNewRandomNews();
    const newsBody = generateRandomNews();
    newsBody.publicationDate = faker.date.past({ years: 1 });

    const { status } = await api.put(`/news/${news.id}`).send(newsBody);
    expect(status).toBe(httpStatus.BAD_REQUEST);
  });


});