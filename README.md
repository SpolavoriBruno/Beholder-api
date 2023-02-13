# Beholder API

O Beholder API é um Bot Trader, capaz receber informações próximo ao tempo real, monitorar gráficos, calcular diversos indicadores e realizar operações de compra e venda.   

Desenvolvido em Nodejs, usando Javascript, o núcleo do Bot é sua API, que dá ao usuário poder de configurar diversos parâmetros como, quais pares de moedas acompanhar, qual intervalo de gráfico, quais indicadores considerar, que tipo de ordem deve ser gerada e como comunicar o usuário quando necessário.

Depois de configurado, se conecta ao streaming dos dados relevantes, realiza cálculos e aplica suas regras sobre esses dados, e se necessário, realiza qual quer ação que  tenha sido configurada. Dentre elas, realizar a compra ou venda de um ativo, avisar o usuário por sms, email ou telegram, e até mesmo chamar um webhook. 

Todas ações executadas são salvas, podendo ser visualizadas, usadas para gerar gráficos e fornecer feedback ao usuário.
Futuramente será implementado um sistema para back-tests, podendo medir o desempenho de estrategias em gráficos reais.

Tecnologias usadas:
Nodejs, Javascript, Express, JWT, Sequelize, Postgres. 

Comunicação com servidores externos com Axios, consumindo uma API, e Websockets.
