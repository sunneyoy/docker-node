const Koa = require("koa");
const mongoose = require("mongoose");
const KoaRouter = require("koa-router");
const bodyParser = require("koa-bodyparser");
const logger = require("koa-logger");

// See http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;

// MongoDB Host
const mongoHost = process.env.MONGO_HOST;
const mongoName = process.env.MONGO_NAME;

// Connect to your MongoDB instance(s)
mongoose.connect(`mongodb://${mongoHost}/${mongoName}`, { useMongoClient: true });
// mongoose.Promise = global.Promise;

// create todo Schema

const TodoSchema = new mongoose.Schema({
  todo: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  createdTime: {
    type: mongoose.Schema.Types.Date,
    default: new Date()
  },
  description: {
    type: String
  }
});

const Todo = mongoose.model("Todo", TodoSchema);

const app = new Koa();

const router = new KoaRouter();

router.get("/todo", async (ctx, next) => {
  const data = await Todo.find();
  ctx.success("成功", data, 200);
  await next();
});

router.post("/todo", async (ctx, next) => {
  const { todo, author, description } = ctx.request.body;
  console.log(todo);
  console.log(author);
  console.log(todo);
  if (!todo) {
    ctx.status = 400;
    return (ctx.body = {
      data: {},
      message: "参数错误,缺少todo"
    });
  }
  if (!author) {
    ctx.status = 400;
    return (ctx.body = {
      data: {},
      message: "参数错误,缺少author"
    });
  }
  const _findTodo = await Todo.findOne({
    todo,
    author
  });
  if (_findTodo) return ctx.error("你已经提交过相同的todo", {}, 400);
  const data = await Todo.create({ todo, author, description });
  ctx.success("获取成功", data, 200);
  await next();
});

// router.get("/todos", async next => {
//   const data = Post.find();
//   ctx.body = {
//     code: 0,
//     message: "success",
//     data
//   };
// });

// router.get("/todos", async next => {
//   const data = Post.find();
//   ctx.body = {
//     code: 0,
//     message: "success",
//     data
//   };
// });

// router.get("/todos", async next => {
//   const data = Post.find();
//   ctx.body = {
//     code: 0,
//     message: "success",
//     data
//   };
// });

app.use(bodyParser());
app.use(logger());
app.use(async (ctx, next) => {
  ctx.error = (message, data = {}, code = -1) => {
    return (ctx.body = {
      code,
      message,
      data
    });
  };

  ctx.success = (message, data = {}, code = 0) => {
    return (ctx.body = {
      code,
      message,
      data
    });
  };
  await next();
});
app.use(router.routes(), router.allowedMethods());

app.listen(6324, err => {
  if (err) console.log(err);
  console.log(`🌴  Koa server listen on 6324`);
});
