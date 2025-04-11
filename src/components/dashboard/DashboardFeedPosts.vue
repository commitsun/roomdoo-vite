<template>
  <div class="feed-rss" :style="{ backgroundImage: `url(${currentPost?.imageUrl})` }">
    <div class="overlay" />
    <div class="post" v-if="currentPost && posts">
      <div class="post-type">Noticias</div>
      <div class="post-title">
        <a :href="currentPost.link" target="_blank" class="link-post">
          {{ currentPost.title }}
        </a>
      </div>
      <div class="post-description" v-html="currentPost.description"></div>
      <div class="post-author">
        Publicado el
        {{
          currentPost.publishDate
            .toString()
            .split(' ')[0]
            .split('-')
            .reverse()
            .join('-')
            .replace('-', '/')
            .replace('-', '/')
        }}
        <span v-if="currentPost.author"> por {{ currentPost.author }} </span>
      </div>
    </div>
    <div v-else class="post">No hay noticias destacadas</div>
    <div class="pagination" v-if="currentPost && posts && posts.length > 1">
      <div @click="prevPost" :class="{ disabled: currentIndex === 0 }" class="circle-icon">
        <CustomIcon
          imagePath="/app-images/back-arrow-black.svg"
          color="#263941"
          width="13px"
          height="13px"
        />
      </div>
      <div
        v-for="(page, index) in pageCount"
        :key="index"
        @click="goToPage(index)"
        :class="{ 'circle-pages': true, active: index === currentIndex }"
      />

      <div
        @click="nextPost"
        :class="{ disabled: currentIndex === posts.length - 1 }"
        class="circle-icon"
      >
        <CustomIcon
          :imagePath="'/app-images/back-arrow-black.svg'"
          :color="'#263941'"
          :width="'13px'"
          :height="'13px'"
          class="icon-right"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, defineComponent, computed, ref } from 'vue';
import { useStore } from '../../store';
import CustomIcon from '../roomdooComponents/CustomIcon.vue';

export default defineComponent({
  components: {
    CustomIcon,
  },
  setup() {
    const store = useStore();
    const posts = computed(() => store.state.dashboard.feedPosts);
    const currentIndex = ref(0);

    const currentPost = computed(() => posts.value[currentIndex.value]);

    const pageCount = computed(() => Math.ceil(posts.value.length));

    const goToPage = (pageIndex: number) => {
      currentIndex.value = pageIndex;
    };
    const prevPost = () => {
      if (currentIndex.value > 0) {
        currentIndex.value -= 1;
      }
    };

    const nextPost = () => {
      if (currentIndex.value < posts.value.length - 1) {
        currentIndex.value += 1;
      }
    };

    onMounted(() => {
      void store.dispatch('dashboard/fetchFeedPosts');
    });
    return {
      posts,
      currentIndex,
      currentPost,
      pageCount,
      goToPage,
      prevPost,
      nextPost,
    };
  },
});
</script>

<style lang="scss" scoped>
.feed-rss {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 13px;
  position: relative;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  .overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: black;
    opacity: 0.6;
    border-radius: 20px;
    top: 0;
    left: 0;
  }
  .post {
    z-index: 1;
    color: #fff;
    .post-type {
      height: 30px;
      font-size: 16px;
      font-weight: 500;
    }
    .post-title {
      font-size: 17px;
      font-weight: 600 !important;
      line-height: 22px;
      text-align: justify;
      .link-post {
        color: #fff;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
    .post-description {
      margin-top: 15px;
      font-size: 14px;
      font-weight: 600;
      display: block;
      line-clamp: 3;
      word-wrap: break-word;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-align: justify;
    }
    .post-author {
      margin-top: 10px;
      font-size: 12px;
    }
  }

  .pagination {
    z-index: 1;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    .circle-icon {
      width: 17px;
      height: 17px;
      border-radius: 50%;
      background-color: #f1f1f1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.3s;
      margin-right: 14px;
      .circle-icon:hover {
        background-color: #a3a0a0;
      }

      .circle-icon.disabled {
        background-color: #ccc;
        cursor: not-allowed;
        pointer-events: none;
      }
    }
    .circle-pages {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #d9d9d9;
      margin-right: 10px;
    }
    .circle-pages.active {
      background-color: $primary;
      width: 11px;
      height: 11px;
    }
    .icon-right {
      rotate: 180deg;
    }
  }
}

@media (min-width: 768px) {
  .feed-rss {
    .post {
      .post-type {
        font-size: 18px;
      }
      .post-title {
        font-size: 20px;
      }
    }
  }
}
</style>
