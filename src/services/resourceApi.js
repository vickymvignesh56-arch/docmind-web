import api from './api';

export const resourceApi = {
  uploadResource: async (channelId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/channels/${channelId}/resources/upload`, formData, {
      headers: {
        // Let Axios and browser calculate multipart boundary automatically
        'Content-Type': undefined,
      },
    });
    return response.data?.data;
  },

  getResources: async (channelId) => {
    const response = await api.get(`/channels/${channelId}/resources`);
    return response.data?.data || [];
  },

  deleteResource: async (channelId, resourceId) => {
    const response = await api.delete(`/channels/${channelId}/resources/${resourceId}`);
    return response.data;
  },

  downloadResource: async (channelId, resourceId, fileName) => {
    const response = await api.get(`/channels/${channelId}/resources/${resourceId}/download`, {
      responseType: 'blob',
    });

    let downloadName = fileName;
    const disposition = response.headers?.['content-disposition'];
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        downloadName = match[1].replace(/['"]/g, '').trim();
      }
    }

    // Create a temporary link to trigger browser download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', downloadName || fileName || `resource-${resourceId}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },


  // Retrieve file blob securely for modal preview without downloading
  getResourceBlob: async (channelId, resourceId) => {
    const response = await api.get(`/channels/${channelId}/resources/${resourceId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
