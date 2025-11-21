<template>
  <div class="sidebar-container">
    <div
      class="support-link"
      v-if="pmsPropertySupportLink"
      @click="$emit('openLink', pmsPropertySupportLink.id)"
    >
      <Headset :size="14" class="nav-link-icon" />
      <span>{{ pmsPropertySupportLink.label }}</span>
    </div>
    <div class="user" :class="{ 'is-open': isOpen }">
      <div class="avatar-container">
        <Avatar
          v-if="user?.avatar"
          size="large"
          shape="circle"
          class="avatar-primary"
          :image="user?.avatar"
        />
        <Avatar
          v-else
          :label="firstTwoInitials(user?.firstName + ' ' + user?.lastName)"
          size="large"
          shape="circle"
          class="avatar-primary"
        />
      </div>
      <div class="user-info">
        <div class="user-name">{{ user?.firstName + ' ' + user?.lastName }}</div>
        <div class="user-mail">{{ user?.email }}</div>
      </div>
      <div class="icon-right">
        <ChevronsUpDown :size="14" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Avatar from 'primevue/avatar';
import { computed, defineComponent } from 'vue';
import { ChevronsUpDown, Headset } from 'lucide-vue-next';

import { useUserStore } from '@/infrastructure/stores/user';
import { firstTwoInitials } from '@/ui/utils/strings';
import type { MenuLink } from '@/domain/entities/MenuLink';

export default defineComponent({
  name: 'SidebarFooter',
  components: {
    Avatar,
    ChevronsUpDown,
    Headset,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: false,
      default: false,
    },
    pmsPropertySupportLink: {
      type: Object as () => MenuLink,
      required: false,
      default: null,
    },
  },
  setup() {
    const userStore = useUserStore();
    const user = computed(() => userStore.user);
    return {
      user,
      firstTwoInitials,
    };
  },
});
</script>

<style lang="scss" scoped>
.sidebar-container {
  .support-link {
    user-select: none;
    margin: 1rem;
    margin-bottom: 7rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0 0.5rem;
    overflow-x: hidden;
    min-height: 21px;
    .nav-link-icon {
      color: #acacac;
      min-width: 14px;
      flex-shrink: 0;
    }
    span {
      margin-right: 1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &:hover {
      cursor: pointer;
      .nav-link-icon {
        color: black;
      }
      span {
        font-weight: bold;
      }
    }
  }
  .user {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 14px;
    margin: 0 5px;
    border-radius: 6px;
    overflow: hidden;
    box-sizing: border-box;
    min-height: 54px;
    background-color: transparent;
    cursor: pointer;
    user-select: none;
    &.is-open {
      background-color: #f1f5f9;
    }
    .avatar-container {
      margin-left: 2px;
      .avatar-primary {
        background-color: var(--p-primary-color);
        color: white;
      }
    }
    .user-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
      .user-name {
        font-size: 14px;
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .user-mail {
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .icon-right {
      margin-right: 5px;
    }
  }
}
</style>
