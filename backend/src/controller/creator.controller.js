async function getCreatorProfileByID(req, res) {
    try {
        const creatorId = req.params.id;
        const creatorProfile = await creatorModel.findById(creatorId).populate('uploadedReels');

        if (!creatorProfile) {
            return res.status(404).json({ success: false, message: "Creator profile not found" });
        }
        return res.status(200).json({ success: true, data: creatorProfile, message: "Creator profile fetched successfully" });
    } catch (error) {
        console.error("Error creating creator profile:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
export default { getCreatorProfileByID };