export default async function globalTeardown() {
    await new Promise((resolve) => setTimeout(resolve, 100));
}
