import { Router, type IRouter } from "express";
import healthRouter from "./health";
import lessonPlanRouter from "./lesson-plan";

const router: IRouter = Router();

router.use(healthRouter);
router.use(lessonPlanRouter);

export default router;
