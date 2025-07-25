
<template>
  <div class="xml-node">
    <details :open="open">
      <summary @click.prevent="toggle" class="cursor-pointer">
        <span class="tag-name">&lt;{{ node.nodeName }}</span>
        <span v-for="attr in node.attributes" :key="attr.name" class="attribute">
          {{ attr.name }}="{{ attr.value }}"
        </span>
        <span v-if="!hasChildElements && !node.textContent">&nbsp;/&gt;</span>
        <span v-else>&gt;</span>
      </summary>

      <div v-if="hasChildElements" class="children">
        <XmlNode v-for="(child, index) in childElements" :key="index" :node="child" />
      </div>
      
      <div v-if="node.textContent?.trim()" class="text-content">
        {{ node.textContent.trim() }}
      </div>

      <div v-if="hasChildElements">
        <span class="tag-name">&lt;/{{ node.nodeName }}&gt;</span>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{ node: Element, open?: boolean }>();

const isOpen = ref(props.open || false);

const childElements = computed(() => Array.from(props.node.children));
const hasChildElements = computed(() => childElements.value.length > 0);

const toggle = () => {
  isOpen.value = !isOpen.value;
  // Manually control the open attribute for better state management
  const details = event.currentTarget.parentElement;
  if (details.hasAttribute('open')) {
    details.removeAttribute('open');
  } else {
    details.setAttribute('open', 'true');
  }
}
</script>

<style scoped>
.xml-node {
  font-family: monospace;
  font-size: 14px;
}
.children {
  padding-left: 20px;
  border-left: 1px solid #444;
}
.tag-name { color: #e06c75; }
.attribute { color: #d19a66; margin-left: 10px; }
.text-content { color: #98c379; padding-left: 20px; }
summary { list-style: none; } /* Hide default triangle */
summary::before {
  content: '▶';
  margin-right: 5px;
  display: inline-block;
  transition: transform 0.1s linear;
}
details[open] > summary::before {
  transform: rotate(90deg);
}
</style>
