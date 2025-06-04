# Arquivo: server.ts

- funçao app.listen() tem numero mágico;


# Arquivo: app.ts

- funçao app.get() tem numero e string magicos;


# Arquivo: news-controller.ts

- funcoes getSpecificNews(), alterNews() e deleteNews() violam DRY na verificacao de ID;

# Arquivo news-service.ts

- funcao validate() com mais de 1 responsabilidade 

# Arquivo error-handler.ts

- melhorar um pouco a complexidade de lógica booleana;

# Arquivo news-repository.ts

- passar o nome dos métodos para inglês;
- algumas funcoes nao tem async