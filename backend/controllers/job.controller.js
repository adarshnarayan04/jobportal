import { Job } from "../models/job.model.js";
import redis from "../utils/redis.js";

export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;

        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });

        // Invalidate jobs cache when a new job is posted
        await redis.del('jobs:all');
        await redis.del(`jobs:company:${companyId}`);
        await redis.del(`jobs:admin:${userId}`);
        
        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Failed to creating a new job.", success: false });
    }
};

export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const cacheKey = `jobs:${keyword || 'all'}`;
        
        // Try to get from Redis
        const cachedJobs = await redis.get(cacheKey);
        if (cachedJobs) {
            const jobs = JSON.parse(cachedJobs);
            return res.status(200).json({ 
                jobs, 
                success: true,
                cached: true 
            });
        }
        
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ]
        };
        
        const jobs = await Job.find(query).populate({ path: "company" }).sort({createdAt: -1});
        if (!jobs) return res.status(404).json({ message: "Jobs are not found!", success: false });

        // Cache for 15 minutes
        await redis.set(cacheKey, JSON.stringify(jobs), 'EX', 900);
        
        return res.status(200).json({ jobs, success: true });
    } catch (error) {
        console.error("Error getting jobs:", error);
        return res.status(400).json({ message: "Failed to get jobs", success: false });
    }
}

export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const cacheKey = `job:${jobId}`;
        
        // Try to get from Redis
        const cachedJob = await redis.get(cacheKey);
        if (cachedJob) {
            return res.status(200).json({
                success: true, 
                job: JSON.parse(cachedJob),
                cached: true
            });
        }
        
        const job = await Job.findById(jobId).populate({
            path: "applications",
        });
        
        if(!job) return res.status(404).json({
            message: "Job not found.",
            success: false
        });
        
        // Cache for 15 minutes
        await redis.set(cacheKey, JSON.stringify(job), 'EX', 900);
        
        return res.status(200).json({success: true, job});
    } catch (error) {
        console.error("Error getting job by id:", error);
        return res.status(400).json({message: "Failed to get job", success: false});
    }
}

// admin
export const getJobByLoggedAdminUser = async (req, res) => {
    try {
        const userId = req.id;
        const cacheKey = `jobs:admin:${userId}`;
        
        // Try to get from Redis
        const cachedJobs = await redis.get(cacheKey);
        if (cachedJobs) {
            return res.status(200).json({
                jobs: JSON.parse(cachedJobs),
                success: true,
                cached: true
            });
        }
        
        const jobs = await Job.find({ created_by: userId }).populate({path: 'company'}).sort({createdAt: -1});
        if (!jobs) return res.status(404).json({ message: "Jobs are not found", success: false });
        
        // Cache for 10 minutes
        await redis.set(cacheKey, JSON.stringify(jobs), 'EX', 600);
        
        return res.status(200).json({
            jobs,
            success: true
        });
    } catch (error) {
        console.error("Error getting admin jobs:", error);
        return res.status(400).json({ message: error.message, success: false });
    }
}