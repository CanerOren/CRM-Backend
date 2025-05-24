const express = require('express');
const router = express.Router();

const citiesRoute = require('../routes/defines/citiesRoute');
const customerRequestImportancesRoute = require('../routes/defines/customerRequestImportancesRoute');
const customerRequestSubjectsRoute = require('../routes/defines/customerRequestSubjectsRoute');
const customerRequestTypesRoute = require('../routes/defines/customerRequestTypesRoute');
const customerTypesRoute = require('../routes/defines/customerTypesRoute');
const districtsRoute = require('../routes/defines/districtsRoute');
const meetingContactTypesRoute = require('../routes/defines/meetingContactTypesRoute');
const meetingLinesRoute = require('./data/meetingLinesRoute');
const meetingStatusesRoute = require('../routes/defines/meetingStatusesRoute');
const meetingSubjectsRoute = require('../routes/defines/meetingSubjectsRoute');
const meetingTypesRoute = require('../routes/defines/meetingTypesRoute');
const userTypesRoute = require('../routes/defines/userTypesRoute');
const usersRoute = require('../routes/core/usersRoute');
const customersRoute = require('../routes/data/customersRoute');
const meetingsRoute = require('../routes/data/meetingsRoute');
const customerRequestsRoute = require('../routes/data/customerRequestsRoute');
const loginRoute = require('../routes/auth/loginRoute');
const getCitiesRoute = require('../routes/defines/getCitiesRoute');
const customerRequestLines = require('./data/customerRequestLinesRoute');
const customerRequestStatuses = require('./defines/customerRequestStatusesRoute');
const indicataRoute = require('./data/indicataRoute');
// DEFINES
router.use('/defines/cities', citiesRoute);
router.use(
  '/defines/customer_request_importances',
  customerRequestImportancesRoute,
);
router.use('/defines/customer_request_subjects', customerRequestSubjectsRoute);
router.use('/defines/customer_request_types', customerRequestTypesRoute);
router.use('/defines/customer_types', customerTypesRoute);
router.use('/defines/districts', districtsRoute);
router.use('/defines/meeting_contact_types', meetingContactTypesRoute);
router.use('/defines/meeting_lines', meetingLinesRoute);
router.use('/defines/meeting_statuses', meetingStatusesRoute);
router.use('/defines/meeting_subjects', meetingSubjectsRoute);
router.use('/defines/meeting_types', meetingTypesRoute);
router.use('/defines/user_types', userTypesRoute);
router.use('/defines/customer_request_statuses', customerRequestStatuses);
// CORE
router.use('/core/users', usersRoute);
//DATA
router.use('/data/customers', customersRoute);
router.use('/data/meetings', meetingsRoute);
router.use('/data/customer_requests', customerRequestsRoute);
router.use('/data/customer_request_lines', customerRequestLines);
router.use('/data/indicata', indicataRoute);
//auth
router.use('/auth', loginRoute);

router.use('/getCities', getCitiesRoute);

module.exports = router;
