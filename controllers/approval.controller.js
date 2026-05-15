const Approval = require('../models/Approval');
const Material = require('../models/Material');
const { successResponse, errorResponse } = require('../utils/response.util');

class ApprovalController {
  async getAll(req, res) {
    try {
      const approvals = await Approval.find().populate('customer').sort({ createdAt: -1 });
      return successResponse(res, { approvals }, 'Approvals fetched successfully', 200);
    } catch (error) {
      return errorResponse(res, error.message, 500, error);
    }
  }

  async create(req, res) {
    try {
      const { title, type, customer, description, requestedBy, department, materialData } = req.body;
      const attachment = req.file ? req.file.filename : undefined;

      const approval = await Approval.create({
        title,
        type,
        customer: customer || undefined,
        description,
        requestedBy,
        department,
        attachment,
        materialData: materialData ? JSON.parse(materialData) : undefined
      });

      return successResponse(res, { approval }, 'Approval request created successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, approvedBy } = req.body;

      if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
        return errorResponse(res, 'Invalid status', 400);
      }

      const approval = await Approval.findById(id);
      if (!approval) return errorResponse(res, 'Approval request not found', 404);

      if (status === 'Approved' && approval.type === 'for approval material request' && approval.materialData) {
        const { name, materialType, quantity, description } = approval.materialData;
        
        const nameKey = [name, materialType]
          .map((v) => String(v || '').trim().toLowerCase())
          .join('|');

        let material = await Material.findOne({ nameKey });

        if (material) {
          const numQty = Number(quantity);
          material.quantity += numQty;
          
          // Update description if provided
          if (description) {
            material.description = description;
          }

          material.transactions.push({
            type: numQty >= 0 ? 'add' : 'withdraw',
            quantity: Math.abs(numQty),
            description: `Auto-${numQty >= 0 ? 'added' : 'withdrawn'} from approved request: ${description || ''}`,
            performedBy: approvedBy,
          });
          await material.save();
        } else {
          const numQty = Number(quantity);
          await Material.create({
            name,
            materialType,
            quantity: numQty,
            description,
            transactions: [{
              type: numQty >= 0 ? 'add' : 'withdraw',
              quantity: Math.abs(numQty),
              description: `Initial ${numQty >= 0 ? 'add' : 'withdrawal'} from approved request: ${description || ''}`,
              performedBy: approvedBy,
            }]
          });
        }
      }

      // As per user instruction: "on approval accept or reject, that card should get removed from approval section"
      await Approval.findByIdAndDelete(id);
      return successResponse(res, {}, `Approval request ${status.toLowerCase()} and removed`, 200);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }

  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { text, authorName } = req.body;

      const approval = await Approval.findByIdAndUpdate(
        id,
        { $push: { comments: { text, authorName } } },
        { new: true }
      );

      if (!approval) return errorResponse(res, 'Approval request not found', 404);

      return successResponse(res, { approval }, 'Comment added', 200);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await Approval.findByIdAndDelete(id);
      return successResponse(res, {}, 'Approval request deleted', 200);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }
}

module.exports = new ApprovalController();
