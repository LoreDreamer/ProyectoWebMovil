import { Router } from 'express';

import activitiesRoutes from '../modules/activities/activities.routes';
import alertsRoutes from '../modules/alerts/alerts.routes';
import authRoutes from '../modules/auth/auth.routes';
import complaintsRoutes from '../modules/complaints/complaints.routes';
import educationRoutes from '../modules/education/education.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import protocolsRoutes from '../modules/protocols/protocols.routes';
import questionnairesRoutes from '../modules/questionnaires/questionnaires.routes';
import subscriptionsRoutes from '../modules/subscriptions/subscriptions.routes';
import securityRoutes from '../modules/security/security.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/alerts', alertsRoutes);
apiRouter.use('/denuncias', complaintsRoutes);
apiRouter.use('/protocolos', protocolsRoutes);
apiRouter.use('/activities', activitiesRoutes);
apiRouter.use('/education', educationRoutes);
apiRouter.use('/questionnaires', questionnairesRoutes);
apiRouter.use('/subscriptions', subscriptionsRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/security', securityRoutes);
