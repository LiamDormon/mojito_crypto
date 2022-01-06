const RESOURCE_NAME = GetCurrentResourceName();

export const GPUDict: IGPUDict = JSON.parse(LoadResourceFile(RESOURCE_NAME, 'cards.json'));
export const Config: IConfig = JSON.parse(LoadResourceFile(RESOURCE_NAME, 'config.json'));
