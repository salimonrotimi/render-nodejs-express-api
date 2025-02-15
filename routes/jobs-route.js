const express = require('express');
const router = express.Router();
const { getAllJobs, getJob, createJob, updateJob, deleteJob } = require('../controller/jobs_controller');

router.route('/').get(getAllJobs).post(createJob); // same as   router.get('/', getAllJobs)   and
// router.post('/', createJob)
router.route('/:id').get(getJob).patch(updateJob).delete(deleteJob); // same as router.get('/:id', getJob)
// router.patch('/:id', updateJob)     and     router.delete('/:id', deleteJob)


module.exports = router;