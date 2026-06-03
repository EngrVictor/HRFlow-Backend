import Recruitment from '../models/Recruitment.js';

export const createRecruitment = async(req, res) => {
    try {
        const recruitment = await Recruitment.create(req.body);
        res.status(201).json({ success: true, data:recruitment });
    } catch(err) {
        res.status(400).json({ success: false, error: err.message });
    }

};

export const getAllRecruitments = async (req, res) => {
    try {
        let query = {};

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.search) {
            query.title = { $regex: req.query.search, $options: 'i'};
        }

        if (req.query.department) {
            query.department = req.query.department;
        }

        const page = parseInt(req.query.page) || 1;
        const limit =parseInt(req.query.limit) || 10;
        const skip = (page -1) * limit;

        const recruitments = await Recruitment.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1});

        const total = await Recruitment.countDocuments(query);

        res.status(200).json({success: true,
            count: recruitments.length,
            total,
            page,
            pages: Math.ceil(total/limit),
            data: recruitments

        });
        } catch(err) {
            res.status(500).json({ success: false, error: err.message });
        }
    };

    export const getRecruitment = async (req, res) => {
        try {
            const recruitment = await Recruitment.findById(req.params.id);
            if(!recruitment) {
                return re.status(404).json({ success: false, messsage: 'Recruitment not found'});
            }
            res.status(200).json({ success: true, data: recruitment });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    };

    export const updateRecruitment = async (req, res) => {
        try {
            const recruitment = await Recruitment.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!recruitment) {
                return res.status(404).json({ success: false, message: 'Recruitment not found'});
            }
            res.status(200).json({ success: true, data: recruitment });
        } catch (err) {
            res.status(400).json({ success: false, error})
        }
    };

    export const deleteRecruitment = async (req, res) => {
        try {
            const recruitment = await Recruitment.findByIdAndDelete(req.params.id);
            if(!recruitment) {
                return res.status(404).json({ succcess: false, message: 'Recruitment not found'});
            }
            res.status(200).json({ success: true, message: 'Deleted successfully'});
        } catch (err) {
            res.status(500).json({ success: false, error: err.message});
        }
    };