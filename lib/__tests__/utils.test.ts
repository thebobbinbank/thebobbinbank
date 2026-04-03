import { describe, expect, it } from 'vitest'
import { base64ToBlob, base64ToDataUrl, cn, getContentType, getPathFromBlobUrl } from '../utils'

describe('cn - className utility', () => {
    it('should merge class names', () => {
        expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
    })

    it('should handle undefined and null values', () => {
        expect(cn('px-2', undefined, 'py-1', null)).toBe('px-2 py-1')
    })

    it('should resolve Tailwind conflicts with twMerge', () => {
        expect(cn('px-2', 'px-4')).toBe('px-4')
    })

    it('should handle conditional classes', () => {
        const isActive = true
        expect(cn('btn', isActive && 'btn-active')).toBe('btn btn-active')
    })
})

describe('getPathFromBlobUrl', () => {
    it('should extract pathname from Vercel Blob URL', () => {
        const url = 'https://f5nbtcwcjwxxb66g.private.blob.vercel-storage.com/patterns/file.pdf'
        expect(getPathFromBlobUrl(url)).toBe('/patterns/file.pdf')
    })

    it('should return pathname as-is if already a path', () => {
        const path = '/patterns/file.pdf'
        expect(getPathFromBlobUrl(path)).toBe(path)
    })

    it('should handle invalid URLs gracefully', () => {
        const invalid = 'not a valid url'
        expect(getPathFromBlobUrl(invalid)).toBe(invalid)
    })

    it('should handle empty strings', () => {
        expect(getPathFromBlobUrl('')).toBe('')
    })
})

describe('base64ToBlob', () => {
    it('should convert base64 to blob with correct content type', () => {
        const base64 = 'SGVsbG8gV29ybGQ=' // "Hello World"
        const blob = base64ToBlob(base64, 'text/plain')

        expect(blob).toBeInstanceOf(Blob)
        expect(blob.type).toBe('text/plain')
    })

    it('should create blob with correct size', () => {
        const base64 = 'SGVsbG8gV29ybGQ=' // "Hello World"
        const blob = base64ToBlob(base64, 'text/plain')

        expect(blob.size).toBeGreaterThan(0)
    })

    it('should handle PDF content type', () => {
        const base64 = 'JVBERi0xLjQK' // PDF header
        const blob = base64ToBlob(base64, 'application/pdf')

        expect(blob.type).toBe('application/pdf')
    })
})

describe('base64ToDataUrl', () => {
    it('should convert base64 to data URL', () => {
        const base64 = 'SGVsbG8gV29ybGQ='
        const dataUrl = base64ToDataUrl(base64, 'text/plain')

        expect(dataUrl).toBe('data:text/plain;base64,SGVsbG8gV29ybGQ=')
    })

    it('should handle image content type', () => {
        const base64 = 'iVBORw0K'
        const dataUrl = base64ToDataUrl(base64, 'image/png')

        expect(dataUrl).toContain('data:image/png;base64,')
    })
})

describe('getContentType', () => {
    it('should return correct content type for PDF', () => {
        expect(getContentType('document.pdf')).toBe('application/pdf')
    })

    it('should return correct content type for PNG', () => {
        expect(getContentType('image.png')).toBe('image/png')
    })

    it('should return correct content type for JPEG', () => {
        expect(getContentType('photo.jpg')).toBe('image/jpeg')
        expect(getContentType('photo.jpeg')).toBe('image/jpeg')
    })

    it('should handle case-insensitive extensions', () => {
        expect(getContentType('FILE.PDF')).toBe('application/pdf')
        expect(getContentType('Image.PNG')).toBe('image/png')
    })

    it('should return default content type for unknown extensions', () => {
        expect(getContentType('file.unknown')).toBe('application/octet-stream')
    })

    it('should handle paths with multiple dots', () => {
        expect(getContentType('archive.backup.zip')).toBe('application/zip')
    })
})
