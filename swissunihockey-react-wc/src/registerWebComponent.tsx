import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import styles from './style.css?inline'

type PropDefinition = Record<string, 'string' | 'number' | 'boolean'>

const toKebabCase = (value: string) =>
    value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

function convertValue(value: string | null, type: 'string' | 'number' | 'boolean') {
    if (type === 'boolean') return value !== null && value !== 'false'
    if (type === 'number') return value === null || value === '' ? undefined : Number(value)
    return value ?? undefined
}

export function registerReactWebComponent<P extends object>(
    tagName: string,
    Component: React.ComponentType<P>,
    propDefinitions: PropDefinition,
) {
    if (customElements.get(tagName)) return

    const attributeToProp = Object.fromEntries(
        Object.keys(propDefinitions).map((prop) => [toKebabCase(prop), prop]),
    )

    class ReactWebComponent extends HTMLElement {
        static observedAttributes = Object.keys(attributeToProp)

        private root?: Root
        private mount?: HTMLDivElement
        private shadow?: ShadowRoot

        connectedCallback() {
            if (!this.shadow) {
                this.shadow = this.attachShadow({ mode: 'open' })

                const style = document.createElement('style')
                style.textContent = styles

                this.mount = document.createElement('div')
                this.mount.className = 'su-shadow-root'

                this.shadow.appendChild(style)
                this.shadow.appendChild(this.mount)

                this.root = createRoot(this.mount)
            }

            this.renderReact()
        }

        disconnectedCallback() {
            this.root?.unmount()
            this.root = undefined
            this.mount = undefined
            this.shadow = undefined
        }

        attributeChangedCallback() {
            this.renderReact()
        }

        private getProps() {
            const props: Record<string, unknown> = {}

            Object.entries(attributeToProp).forEach(([attribute, prop]) => {
                props[prop] = convertValue(this.getAttribute(attribute), propDefinitions[prop])
            })

            return props as P
        }

        private renderReact() {
            if (!this.isConnected || !this.root) return
            this.root.render(<Component {...this.getProps()} />)
        }
    }

    customElements.define(tagName, ReactWebComponent)
}