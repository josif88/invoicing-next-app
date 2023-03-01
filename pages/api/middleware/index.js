import * as jwt from "jsonwebtoken";
import prisma from "../../../utils/db";
import { unAuthRes } from "../../../utils/response";

export const verifyAdmin = (handler) => {
  return async (req, res) => {
    const storedToken = req.cookies.token;
    let payload = undefined;
    try {
      payload = jwt.verify(storedToken, process.env.JWT_SECRET);
      const admin = await prisma.admin.findFirst({ where: { id: payload.id } });
      req.admin = admin;
    } catch (e) {
      return unAuthRes(res);
    }

    return handler(req, res);
  };
};

export const writeAuth = (handler) => {
  return async (req, res) => {
    if (req.method.toLowerCase() === "get") return handler(req, res);
    else {
      const storedToken = req.cookies.token;
      let payload = undefined;
      try {
        payload = jwt.verify(storedToken, process.env.JWT_SECRET);
        const admin = await prisma.admin.findFirst({
          where: { id: payload.id },
        });
        req.admin = admin;
      } catch (e) {
        return unAuthRes(res);
      } finally {
        await prisma.$disconnect();
      }

      return handler(req, res);
    }
  };
};

const paginate = (p = 1, s = 10) => {
  let take = s;
  let skip = (p - 1) * take;
  return { take, skip };
};

export const pagination = (handler) => {
  return async (req, res) => {
    let { p, s, q, ...restTerms } = req.query;
    let { skip, take } = paginate(p, s);
    let whereObj;

    if (q) {
      whereObj = {
        active: true,
        name: { contains: q },
      };
    } else whereObj = { ...restTerms, active: true };

    const options = {
      where: whereObj,
      take: Number.parseInt(take),
      skip: Number.parseInt(skip),
      orderBy: { id: "desc" },
    };

    req.options = options;

    return handler(req, res);
  };
};

export const expensesOptions = (handler) => {
  return async (req, res) => {
    let { p, s, q, ...restTerms } = req.query;
    let { skip, take } = paginate(p, s);
    let whereObj;

    if (q) {
      whereObj = {
        active: true,
        OR: [{ issuedTo: { contains: q } }, { category: { contains: q } }],
      };
    } else whereObj = { ...restTerms, active: true };

    const options = {
      where: whereObj,
      take: Number.parseInt(take),
      skip: Number.parseInt(skip),
      orderBy: { id: "desc" },
    };

    req.options = options;

    return handler(req, res);
  };
};

export const nameSearch = (handler) => {
  return async (req, res) => {
    let { p, s, q, ...restTerms } = req.query;
    let { skip, take } = paginate(p, s);
    let whereObj;

    if (q) {
      whereObj = {
        active: true,
        customer: { name: { contains: q } },
      };
    } else whereObj = { ...restTerms, active: true };

    const options = {
      where: whereObj,
      take: Number.parseInt(take),
      skip: Number.parseInt(skip),
      orderBy: { id: "desc" },
    };

    req.options = options;

    return handler(req, res);
  };
};

export const limit = (handler) => {
  return async (req, res) => {
    let { p, s, ...restTerms } = req.query;
    let { skip, take } = paginate(p, s);

    const options = {
      take: Number.parseInt(take),
      skip: Number.parseInt(skip),
      orderBy: { id: "desc" },
    };

    req.options = options;

    return handler(req, res);
  };
};
