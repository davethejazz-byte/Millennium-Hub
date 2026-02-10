export function normalizeText(value) {
  return (value ?? "").toString().trim();
}

export function normalizeOptionalText(value) {
  const normalized = normalizeText(value);
  return normalized.length ? normalized : "";
}

export function isValidEmail(value) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidUrl(value) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function hasDuplicateApplication(applications, jobId, email) {
  const normalizedEmail = normalizeText(email).toLowerCase();
  return applications.some(
    (application) =>
      application.job_id === jobId &&
      normalizeText(application.applicant_email).toLowerCase() === normalizedEmail
  );
}

export function filterOpenJobs(jobs, now = new Date()) {
  return jobs.filter(
    (job) =>
      job.needs_operator &&
      job.status !== "cancelled" &&
      job.status !== "completed" &&
      new Date(job.start_date) > now
  );
}

export function validateJobForm(formData) {
  const title = normalizeText(formData.title);
  if (!title) return { ok: false, message: "Job title is required." };

  if (!formData.start_date) return { ok: false, message: "Start date is required." };
  const startDate = new Date(formData.start_date);
  if (Number.isNaN(startDate.getTime())) return { ok: false, message: "Start date is invalid." };

  let endDate = null;
  if (formData.end_date) {
    endDate = new Date(formData.end_date);
    if (Number.isNaN(endDate.getTime())) return { ok: false, message: "End date is invalid." };
    if (endDate < startDate) return { ok: false, message: "End date must be after start date." };
  }

  const clientEmail = normalizeOptionalText(formData.client_email);
  if (clientEmail && !isValidEmail(clientEmail)) {
    return { ok: false, message: "Client email is invalid." };
  }

  if (formData.needs_operator) {
    const operatorCategory = normalizeOptionalText(formData.operator_category);
    if (!operatorCategory) {
      return { ok: false, message: "Select an operator type when operator support is enabled." };
    }
  }

  return {
    ok: true,
    data: {
      ...formData,
      title,
      client_name: normalizeOptionalText(formData.client_name),
      client_email: clientEmail,
      client_phone: normalizeOptionalText(formData.client_phone),
      location: normalizeOptionalText(formData.location),
      description: normalizeOptionalText(formData.description),
      notes: normalizeOptionalText(formData.notes),
      operator_description: normalizeOptionalText(formData.operator_description),
      start_date: startDate.toISOString(),
      end_date: endDate ? endDate.toISOString() : null,
    },
  };
}

export function validateClientForm(formData) {
  const name = normalizeText(formData.name);
  if (!name) return { ok: false, message: "Client name is required." };

  const email = normalizeOptionalText(formData.email);
  if (email && !isValidEmail(email)) return { ok: false, message: "Client email is invalid." };

  return {
    ok: true,
    data: {
      ...formData,
      name,
      contact_name: normalizeOptionalText(formData.contact_name),
      email,
      phone: normalizeOptionalText(formData.phone),
      address: normalizeOptionalText(formData.address),
      notes: normalizeOptionalText(formData.notes),
    },
  };
}

export function validateTeamForm(formData) {
  const name = normalizeText(formData.name);
  if (!name) return { ok: false, message: "Team member name is required." };

  const email = normalizeText(formData.email);
  if (!isValidEmail(email)) return { ok: false, message: "A valid team member email is required." };

  return {
    ok: true,
    data: {
      ...formData,
      name,
      email,
      phone: normalizeOptionalText(formData.phone),
      role: normalizeOptionalText(formData.role),
      photo_url: normalizeOptionalText(formData.photo_url),
      bio: normalizeOptionalText(formData.bio),
    },
  };
}

export function validateBusinessCardForm(formData) {
  const name = normalizeText(formData.name);
  if (!name) return { ok: false, message: "Card name is required." };

  const email = normalizeOptionalText(formData.email);
  if (email && !isValidEmail(email)) return { ok: false, message: "Card email is invalid." };

  const linkedinUrl = normalizeOptionalText(formData.linkedin_url);
  if (linkedinUrl && !isValidUrl(linkedinUrl)) return { ok: false, message: "LinkedIn URL must be a valid URL." };

  const instagramUrl = normalizeOptionalText(formData.instagram_url);
  if (instagramUrl && !isValidUrl(instagramUrl)) return { ok: false, message: "Instagram URL must be a valid URL." };

  return {
    ok: true,
    data: {
      ...formData,
      name,
      email,
      phone: normalizeOptionalText(formData.phone),
      title: normalizeOptionalText(formData.title),
      linkedin_url: linkedinUrl,
      instagram_url: instagramUrl,
      custom_message: normalizeOptionalText(formData.custom_message),
      photo_url: normalizeOptionalText(formData.photo_url),
    },
  };
}

export function validateApplicationForm(formData) {
  const name = normalizeText(formData.name);
  if (!name) return { ok: false, message: "Your name is required." };

  const email = normalizeText(formData.email);
  if (!isValidEmail(email)) return { ok: false, message: "A valid email is required." };

  return {
    ok: true,
    data: {
      name,
      email,
      message: normalizeOptionalText(formData.message),
    },
  };
}
