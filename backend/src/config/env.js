function normalizeEnvValue(value) {
    if (typeof value !== 'string') {
        return undefined;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length ? trimmedValue : undefined;
}

export function getEnv(name, options = {}) {
    const { required = false, defaultValue } = options;
    const value = normalizeEnvValue(process.env[name]);

    if (value !== undefined) {
        return value;
    }

    if (required) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return defaultValue;
}

export function getBooleanEnv(name, defaultValue = false) {
    const value = getEnv(name);
    if (value === undefined) {
        return defaultValue;
    }

    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export function getListEnv(name, separator = ',') {
    const value = getEnv(name);
    if (!value) {
        return [];
    }

    return value
        .split(separator)
        .map((item) => item.trim())
        .filter(Boolean);
}
