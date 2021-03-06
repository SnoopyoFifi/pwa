const Koa = require('koa');

const app = new Koa();
const koaStatic = require('koa-static');
const Router = require('koa-router');
const router = new Router();

app.use(koaStatic('.'));

router.get('/cacheFirst', (ctx, next) => {
  return ctx.body = Date.now();
});

router.get('/networkOnly', (ctx, next) => {
  return ctx.body = ctx.body = Date.now();
});

app.use(router.routes());

app.listen(3001, function () {
  console.log('app is listening on 3001')
});
