import type { MediaAsset, MediaCollection, PaginatedResponse, MediaFilters } from "../types/media.types";
import { MOCK_MEDIA_ASSETS, MOCK_MEDIA_COLLECTIONS } from "../data/mock-media-data";

const ASSETS_KEY = "church-mock-media-library";
const COLLECTIONS_KEY = "church-mock-media-collections";

// Helper to check window and get items
function getStoredItems<T>(key: string, defaultItems: T[]): T[] {
  if (typeof window === "undefined") return defaultItems;
  try {
    const data = window.localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    } else {
      window.localStorage.setItem(key, JSON.stringify(defaultItems));
      return defaultItems;
    }
  } catch (err) {
    console.warn(`Error reading localStorage for key ${key}`, err);
    return defaultItems;
  }
}

// Helper to save items
function setStoredItems<T>(key: string, items: T[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
    // Dispatch custom event for tab sync
    window.dispatchEvent(
      new CustomEvent("local-storage-update", {
        detail: { key, newValue: items }
      })
    );
  } catch (err) {
    console.warn(`Error writing localStorage for key ${key}`, err);
  }
}

export const MediaRepository = {
  /**
   * Fetches assets scoped by branch and permission restrictions, filtered and paginated.
   */
  async getAssets(
    filters: MediaFilters,
    context: { branchId: string; role: string }
  ): Promise<PaginatedResponse<MediaAsset>> {
    // 1. Load raw database list
    let list = getStoredItems<MediaAsset>(ASSETS_KEY, MOCK_MEDIA_ASSETS);

    // 2. Enforce Branch-Level Scope:
    // Pastors, Admin and Media Team can see all branches if they choose,
    // but Members and Visitors are strictly restricted to their current branch ID.
    const isSpecialist = ["Super Admin", "Pastor", "Church Admin", "Media Team"].includes(context.role);
    if (!isSpecialist) {
      list = list.filter((asset) => asset.branch_id === context.branchId);
    }

    // 3. Enforce Permission-Level Gating:
    // Private assets (is_public: false) are visible only to Admins, Pastors, and Media Team.
    // Members and Visitors see only public assets.
    const canSeePrivate = ["Super Admin", "Pastor", "Church Admin", "Media Team", "Treasurer"].includes(context.role);
    if (!canSeePrivate) {
      list = list.filter((asset) => asset.is_public);
    }

    // 4. Archive Visibility gating:
    // Only show archived files if requested explicitly, and only to admins/media coordinator
    const canSeeArchived = ["Super Admin", "Pastor", "Church Admin", "Media Team"].includes(context.role);
    const showArchived = !!filters.showArchived && canSeeArchived;
    list = list.filter((asset) => asset.is_archived === showArchived);

    // 5. Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      list = list.filter(
        (asset) =>
          asset.title.toLowerCase().includes(searchLower) ||
          asset.description.toLowerCase().includes(searchLower) ||
          asset.file_name.toLowerCase().includes(searchLower)
      );
    }

    if (filters.type && filters.type !== "all") {
      list = list.filter((asset) => asset.file_type === filters.type);
    }

    if (filters.category && filters.category !== "all") {
      list = list.filter((asset) => asset.category === filters.category);
    }

    // Sort by created date descending by default
    list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 6. Pagination Envelope Calculation
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 8;
    const count = list.length;
    const totalPages = Math.max(1, Math.ceil(count / pageSize));
    const offset = (page - 1) * pageSize;
    const results = list.slice(offset, offset + pageSize);

    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      count,
      page,
      page_size: pageSize,
      total_pages: totalPages,
      next: hasNext ? `?page=${page + 1}` : null,
      previous: hasPrevious ? `?page=${page - 1}` : null,
      results
    };
  },

  /**
   * Fetches collections for the branch.
   */
  async getCollections(branchId: string): Promise<MediaCollection[]> {
    const list = getStoredItems<MediaCollection>(COLLECTIONS_KEY, MOCK_MEDIA_COLLECTIONS);
    return list.filter((col) => col.branch_id === branchId);
  },

  /**
   * Retrieves single asset by ID (with authorization checks).
   */
  async getAssetById(id: string, context: { branchId: string; role: string }): Promise<MediaAsset | null> {
    const list = getStoredItems<MediaAsset>(ASSETS_KEY, MOCK_MEDIA_ASSETS);
    const asset = list.find((a) => a.id === id) || null;
    if (!asset) return null;

    // Security check
    const isSpecialist = ["Super Admin", "Pastor", "Church Admin", "Media Team"].includes(context.role);
    if (!isSpecialist && asset.branch_id !== context.branchId) {
      throw new Error("Access denied: Branch scoping violation");
    }

    const canSeePrivate = ["Super Admin", "Pastor", "Church Admin", "Media Team", "Treasurer"].includes(context.role);
    if (!canSeePrivate && !asset.is_public) {
      throw new Error("Access denied: Private resource");
    }

    return asset;
  },

  /**
   * Adds a new media asset.
   */
  async createAsset(assetData: Omit<MediaAsset, "id" | "created_at" | "updated_at" | "download_count">): Promise<MediaAsset> {
    const list = getStoredItems<MediaAsset>(ASSETS_KEY, MOCK_MEDIA_ASSETS);
    
    // Generate UUID v4
    const id = crypto.randomUUID ? crypto.randomUUID() : `uuid-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const now = new Date().toISOString();

    const newAsset: MediaAsset = {
      ...assetData,
      id,
      download_count: 0,
      created_at: now,
      updated_at: now
    };

    const updatedList = [newAsset, ...list];
    setStoredItems(ASSETS_KEY, updatedList);
    return newAsset;
  },

  /**
   * Updates fields of a media asset.
   */
  async updateAsset(id: string, updates: Partial<Omit<MediaAsset, "id">>): Promise<MediaAsset> {
    const list = getStoredItems<MediaAsset>(ASSETS_KEY, MOCK_MEDIA_ASSETS);
    let updatedAsset: MediaAsset | null = null;

    const updatedList = list.map((asset) => {
      if (asset.id === id) {
        updatedAsset = {
          ...asset,
          ...updates,
          updated_at: new Date().toISOString()
        };
        return updatedAsset;
      }
      return asset;
    });

    if (!updatedAsset) throw new Error("Asset not found");
    setStoredItems(ASSETS_KEY, updatedList);
    return updatedAsset;
  },

  /**
   * Soft-deletes a media asset.
   */
  async archiveAsset(id: string): Promise<void> {
    await this.updateAsset(id, {
      is_archived: true,
      archived_at: new Date().toISOString()
    });
  },

  /**
   * Restores a soft-deleted media asset.
   */
  async restoreAsset(id: string): Promise<void> {
    await this.updateAsset(id, {
      is_archived: false,
      archived_at: null
    });
  },

  /**
   * Increments download counter.
   */
  async incrementDownloadCount(id: string): Promise<void> {
    const list = getStoredItems<MediaAsset>(ASSETS_KEY, MOCK_MEDIA_ASSETS);
    const updatedList = list.map((asset) => {
      if (asset.id === id) {
        return {
          ...asset,
          download_count: asset.download_count + 1
        };
      }
      return asset;
    });
    setStoredItems(ASSETS_KEY, updatedList);
  },

  /**
   * Creates a new media collection.
   */
  async createCollection(name: string, description: string, branchId: string, createdBy: string): Promise<MediaCollection> {
    const list = getStoredItems<MediaCollection>(COLLECTIONS_KEY, MOCK_MEDIA_COLLECTIONS);
    const id = crypto.randomUUID ? crypto.randomUUID() : `uuid-col-${Date.now()}`;
    
    const newCol: MediaCollection = {
      id,
      name,
      description,
      branch_id: branchId,
      created_by: createdBy,
      created_at: new Date().toISOString()
    };

    const updatedList = [...list, newCol];
    setStoredItems(COLLECTIONS_KEY, updatedList);
    return newCol;
  }
};
