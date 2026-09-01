import { Router, type IRouter } from "express";
import healthRouter from "./health";
import lessonPlanRouter from "./lesson-plan";
import teachingMessageRouter from "./teaching-message";

const router: IRouter = Router();

router.use(healthRouter);
router.use(lessonPlanRouter);
router.use(teachingMessageRouter);

export default router;
