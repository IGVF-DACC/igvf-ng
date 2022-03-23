import DarkModeManager from "../dark-mode-manager"
import MatchMediaMock from "../__mocks__/media-query-mock"

describe("Test proper DOM manipulation for Tailwind CSS dark mode", () => {
  let darkModeManager

  beforeEach(() => {
    darkModeManager = new DarkModeManager()
  })

  it("sets dark and light mode manually", () => {
    // Test we can set dark mode manually
    darkModeManager.setDarkMode()
    expect(document.documentElement.classList.contains("dark")).toBe(true)

    // Test we can set light mode manually
    darkModeManager.setLightMode()
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("reacts to OS dark-mode changes", () => {
    darkModeManager.setLightMode()

    // Install the mock for window.matchMedia().
    const matchMedia = new MatchMediaMock()

    // Install the dark-mode event listener.
    darkModeManager.installDarkModeListener()

    // Trigger the dark-mode event.
    matchMedia.useMediaQuery("(prefers-color-scheme: dark)", true)
    expect(document.documentElement.classList.contains("dark")).toBe(true)

    // Trigger the light-mode event.
    matchMedia.useMediaQuery("(prefers-color-scheme: dark)", false)
    expect(document.documentElement.classList.contains("dark")).toBe(false)

    darkModeManager.removeDarkModeListener()
    matchMedia.destroy()
  })

  it("detects the current OS dark mode", () => {
    // Install the mock for window.matchMedia() with OS configured for light mode.
    const matchMediaLight = new MatchMediaMock()
    darkModeManager.setCurrentDarkMode()
    expect(document.documentElement.classList.contains("dark")).toBe(false)
    matchMediaLight.destroy()

    // Install the mock for window.matchMedia() with OS configured for dark mode.
    const matchMediaDark = new MatchMediaMock("(prefers-color-scheme: dark)")
    darkModeManager.setCurrentDarkMode()
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    matchMediaDark.destroy()
  })
})
