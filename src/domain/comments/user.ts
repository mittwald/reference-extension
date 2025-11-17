import { assertStatus, type MittwaldAPIV2Client } from "@mittwald/api-client";

export async function getUserName(
    mittwaldClient: MittwaldAPIV2Client,
    userId: string,
): Promise<string> {
    const response = await mittwaldClient.user.getUser({ userId });
    assertStatus(response, 200);

    return response.data.person.firstName;
}

export async function getUserAvatar(
    mittwaldClient: MittwaldAPIV2Client,
    userId: string,
): Promise<string | undefined> {
    const response = await mittwaldClient.user.getUser({ userId });
    assertStatus(response, 200);
    return response.data.avatarRef
        ? `https://api.mittwald.de/v2/files/${response.data.avatarRef}`
        : undefined;
}
