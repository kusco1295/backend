const Material = require('../models/Material');

const normalize = (value) => String(value || '').trim().toLowerCase();
const toCapital = (value) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
const toNameKey = (name, materialType) => [name, materialType].map(normalize).join('|');
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findMaterialByIdentity = async (name, materialType) => {
  const nameKey = toNameKey(name, materialType);
  return await Material.findOne({
    $or: [
      { nameKey },
      { name: toCapital(name), materialType: toCapital(materialType) },
      { name: new RegExp(`^${escapeRegex(String(name).trim())}$`, 'i'), materialType: new RegExp(`^${escapeRegex(String(materialType).trim())}$`, 'i') },
    ],
  });
};

class MaterialService {
  async getAllMaterials() {
    const materials = await Material.find().sort({ updatedAt: -1, name: 1 });
    return materials.map((material) => {
      const doc = material.toObject ? material.toObject() : material;
      const materialType = doc.materialType || doc.type || '';
      doc.materialType = materialType;
      return doc;
    });
  }

  async addMaterial({ name, materialType, description, quantity, performedBy }) {
    const cleanName = toCapital(name);
    const cleanMaterialType = toCapital(materialType);
    const cleanDescription = String(description || '').trim();
    const qty = Number(quantity);

    if (!cleanName) throw new Error('Material name is required');
    if (!cleanMaterialType) throw new Error('Type is required');
    if (!Number.isFinite(qty) || qty <= 0) throw new Error('Quantity must be greater than 0');

    const nameKey = toNameKey(cleanName, cleanMaterialType);
    const material = await findMaterialByIdentity(cleanName, cleanMaterialType);

    if (material) {
      material.name = cleanName;
      material.materialType = cleanMaterialType;
      material.description = cleanDescription || material.description;
      material.quantity += qty;
      material.transactions.push({
        type: 'add',
        quantity: qty,
        description: cleanDescription,
        performedBy,
      });
      await material.save();
      return material;
    }

    const created = new Material({
      name: cleanName,
      nameKey,
      materialType: cleanMaterialType,
      description: cleanDescription,
      quantity: qty,
      transactions: [{
        type: 'add',
        quantity: qty,
        description: cleanDescription,
        performedBy,
      }],
    });

    await created.save();
    return created;
  }

  async withdrawMaterial({ name, materialType, description, quantity, performedBy }) {
    const cleanName = toCapital(name);
    const cleanMaterialType = toCapital(materialType);
    const cleanDescription = String(description || '').trim();
    const qty = Number(quantity);

    if (!cleanName) throw new Error('Material name is required');
    if (!cleanMaterialType) throw new Error('Type is required');
    if (!Number.isFinite(qty) || qty <= 0) throw new Error('Quantity must be greater than 0');

    const material = await findMaterialByIdentity(cleanName, cleanMaterialType);
    if (!material) throw new Error('Material not found for the specified name and type');
    if (material.quantity < qty) throw new Error('Not enough quantity in stock');

    material.quantity -= qty;
    material.description = cleanDescription || material.description;
    material.transactions.push({
      type: 'withdraw',
      quantity: qty,
      description: cleanDescription,
      performedBy,
    });
    await material.save();
    return material;
  }
}

module.exports = new MaterialService();
