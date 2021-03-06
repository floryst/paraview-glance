import { mapGetters, mapState, mapActions } from 'vuex';

import RawFileReader from 'paraview-glance/src/components/core/RawFileReader';
import DragAndDrop from 'paraview-glance/src/components/widgets/DragAndDrop';
import GirderBox from 'paraview-glance/src/components/core/GirderBox';

// ----------------------------------------------------------------------------

export default {
  name: 'FileLoader',
  components: {
    RawFileReader,
    DragAndDrop,
    GirderBox,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      active_tab: 0,
    };
  },
  mounted() {
    this.$root.$on('open_girder_panel', () => {
      this.active_tab = 1;
    });
  },
  computed: {
    ...mapState('files', {
      // show file list with recent on top
      fileList: (state) => Array.from(state.fileList).reverse(),
      pendingFiles: (state) =>
        state.fileList.reduce(
          (flag, file) => flag || file.state === 'loading',
          false
        ),
      hasReadyFiles: (state) =>
        state.fileList.reduce(
          (flag, file) => flag || file.state === 'ready',
          false
        ),
    }),
    ...mapGetters('files', ['anyErrors']),
  },
  methods: {
    ...mapActions('files', [
      'openFiles',
      'promptLocal',
      'deleteFile',
      'load',
      'resetQueue',
    ]),
    ...mapActions('files', {
      SetRawFileInfo: (dispatch, index, info) =>
        dispatch('setRawFileInfo', { index, info }),
    }),
    loadFiles() {
      this.loading = true;
      this.load().finally(() => {
        this.close();
        this.$emit('load');
        // hack to keep the load button disabled until window closes
        setTimeout(() => {
          this.loading = false;
        }, 10);
      });
    },
    onDialogChange(state) {
      if (!state) {
        this.close();
      } else {
        this.$emit('input', true);
      }
    },
    close() {
      this.$emit('input', false);
      // hack to reset queue only after the file dialog closes
      setTimeout(() => this.resetQueue(), 10);
    },
  },
};
